import { LixiDto, Lixi } from '@bcpros/lixi-models';
import MinimalBCHWallet from '@bcpros/minimal-xpi-slp-wallet';
import BCHJS from '@bcpros/xpi-js';
import {
  OnQueueEvent,
  OnWorkerEvent,
  Processor,
  QueueEventsHost,
  QueueEventsListener,
  WorkerHost
} from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Parser } from 'json2csv';
import * as _ from 'lodash';
import { EXPORT_SUB_LIXIES_QUEUE } from 'src/modules/core/lixi/constants/lixi.constants';
import { ExportSubLixiesJobData, ExportSubLixiesJobResult } from 'src/modules/core/lixi/models/lixi.models';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { WalletService } from 'src/modules/wallet/wallet.service';
import { aesGcmDecrypt, numberToBase58 } from 'src/utils/encryptionMethods';
import * as fs from 'fs';
import moment from 'moment';

@Injectable()
@Processor(EXPORT_SUB_LIXIES_QUEUE)
export class ExportSubLixiesProcessor extends WorkerHost {
  private logger: Logger = new Logger(ExportSubLixiesProcessor.name);
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
    @Inject('xpijs') private XPI: BCHJS,
    @Inject('xpiWallet') private xpiWallet: MinimalBCHWallet
  ) {
    super();
  }

  public async process(job: Job<ExportSubLixiesJobData, boolean, string>): Promise<ExportSubLixiesJobResult> {
    return this.processExportSubLixies(job);
  }

  public async processExportSubLixies(job: Job): Promise<ExportSubLixiesJobResult> {
    const jobData = job.data as ExportSubLixiesJobData;

    const lixi = await this.prisma.lixi.findFirst({
      where: {
        id: _.toSafeInteger(jobData.parentId)
      }
    });

    const account = await this.prisma.account.findFirst({
      where: {
        id: _.toSafeInteger(lixi?.accountId)
      }
    });

    let subLixies = await this.prisma.lixi.findMany({
      where: {
        parentId: jobData.parentId
      }
    });

    if (lixi?.numberLixiPerPackage) {
      const packIdes: (number | null)[] = [];
      subLixies
        .map(item => item.packageId)
        .filter(element => (packIdes.includes(element) ? '' : packIdes.push(element)));
      const packages = await this.prisma.package.findMany({
        where: {
          id: { in: packIdes as unknown as number }
        }
      });

      // const res:any = subLixies.map(lixi => packages.find(pack => pack.id === lixi.packageId) || lixi);

      const res = subLixies.map((item, i) => {
        if (item.id === packages[i].id) {
          return Object.assign({}, item, packages[i]);
        }
      });
    }

    const childrenApiResult: LixiDto[] = [];

    for (let item of subLixies) {
      const childResult = _.omit(
        {
          ...item,
          totalClaim: Number(item.totalClaim),
          expiryAt: item.expiryAt ? item.expiryAt : undefined,
          country: item.country ? item.country : undefined
        } as LixiDto,
        'encryptedXPriv',
        'encryptedClaimCode'
      );

      try {
        const claimPart = await aesGcmDecrypt(item.encryptedClaimCode, jobData.secret);
        const encodedId = numberToBase58(item.id);
        childResult.claimCode = claimPart + encodedId;
      } catch (err) {
        this.logger.error(err);
        continue;
      }
      childrenApiResult.push(childResult);
    }
    const parser = new Parser({
      fields: ['name', 'claimCode', 'amount', 'package']
    });
    const csvData: any[] = childrenApiResult.map(item => {
      return {
        name: item.name,
        claimCode: item.claimCode,
        amount: item.amount,
        package: item.packageId ? numberToBase58(item.packageId) : ''
      };
    });
    const csv = parser.parse(childrenApiResult);
    const dir = './public/download/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    var timestamp = moment().format('YYYYMMDD');
    const fileName = `${lixi?.id}_${timestamp}.csv`;
    const filePath = `public/download/${fileName}`;
    fs.writeFile(`./${filePath}`, csv, function (err) {
      if (err) {
        throw err;
      }
    });
    return {
      id: jobData.parentId,
      name: lixi?.name,
      jobName: job.name,
      path: filePath,
      fileName: fileName,
      mnemonicHash: account?.mnemonicHash,
      senderId: account?.id,
      recipientId: account?.id
    } as ExportSubLixiesJobResult;
  }
}
