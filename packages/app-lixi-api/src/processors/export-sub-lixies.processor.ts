import { LixiDto, Lixi } from '@bcpros/lixi-models';
import MinimalBCHWallet from '@bcpros/minimal-xpi-slp-wallet';
import BCHJS from '@bcpros/xpi-js';
import { OnQueueEvent, OnWorkerEvent, Processor, QueueEventsHost, QueueEventsListener, WorkerHost } from "@nestjs/bullmq";
import { Inject, Injectable } from "@nestjs/common";
import { Job } from "bullmq";
import { Parser } from 'json2csv';
import * as _ from 'lodash';
import { EXPORT_SUB_LIXIES_QUEUE } from 'src/constants/lixi.constants';
import logger from 'src/logger';
import { ExportSubLixiesJobData } from "src/models/lixi.models";
import { PrismaService } from 'src/services/prisma/prisma.service';
import { WalletService } from 'src/services/wallet.service';
import { aesGcmDecrypt, numberToBase58 } from 'src/utils/encryptionMethods';
import * as fs from 'fs';

@Injectable()
@Processor(EXPORT_SUB_LIXIES_QUEUE)
export class ExportSubLixiesProcessor extends WorkerHost {

  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
    @Inject('xpijs') private XPI: BCHJS,
    @Inject('xpiWallet') private xpiWallet: MinimalBCHWallet
  ) {
    super();
  }

  public async process(job: Job<ExportSubLixiesJobData, boolean, string>): Promise<boolean> {
    return this.processExportSubLixies(job);
  }

  public async processExportSubLixies(job: Job): Promise<boolean> {
    const jobData = job.data as ExportSubLixiesJobData;

    const lixi = await this.prisma.lixi.findFirst({
      where: {
        id: jobData.parentId,
      }
    });

    const subLixies = await this.prisma.lixi.findMany({
      where: {
        parentId: jobData.parentId,
      }
    });

    const childrenApiResult: LixiDto[] = [];

    for (let item of subLixies) {
      const childResult = _.omit({
        ...item,
        totalClaim: Number(item.totalClaim),
        expiryAt: item.expiryAt ? item.expiryAt : undefined,
        country: item.country ? item.country : undefined,
      } as LixiDto, 'encryptedXPriv', 'encryptedClaimCode');

      try {
        const claimPart = await aesGcmDecrypt(item.encryptedClaimCode, jobData.secret);
        const encodedId = numberToBase58(item.id);
        childResult.claimCode = claimPart + encodedId;
      } catch (err) {
        logger.error(err);
        continue;
      }
      childrenApiResult.push(childResult);
    }
    const parser = new Parser({
      fields: ['name', 'claimCode', 'amount']
    });
    const csv = parser.parse(childrenApiResult);
    console.log((lixi as any).id);
    const dir = './public/download/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    fs.writeFile('./public/download/' + (lixi as any).id + '.csv', csv, function (err) {
      if (err) {
        throw err;
      }
    })
    return true;
  }
}