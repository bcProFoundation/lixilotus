import MinimalBCHWallet from '@bcpros/minimal-xpi-slp-wallet';
import BCHJS from '@bcpros/xpi-js';
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { PrismaClient } from '@prisma/client';
import { Job } from "bullmq";
import * as _ from 'lodash';
import { CREATE_SUB_LIXIES_QUEUE, LIXI_JOB_NAMES } from 'src/modules/core/lixi/constants/lixi.constants';
import { CreateSubLixiesJobData, CreateSubLixiesJobResult } from "src/modules/core/lixi/models/lixi.models";
import { WalletService } from 'src/modules/wallet/wallet.service';
import config from 'config';
import SlpWallet from '@bcpros/minimal-xpi-slp-wallet';
import { processCreateSubLixiesChunk } from './create-sub-lixies.isolated.processor';
import { Injectable } from '@nestjs/common';

@Injectable()
@Processor(CREATE_SUB_LIXIES_QUEUE, { concurrency: 3 })
export class CreateSubLixiesProcessor extends WorkerHost {

  private prisma: PrismaClient;
  private walletService: WalletService;
  private XPI: BCHJS;
  private xpiWallet: MinimalBCHWallet;

  constructor(
  ) {
    super();
    const xpiRestUrl = config.has('xpiRestUrl')
      ? config.get('xpiRestUrl')
      : 'https://api.sendlotus.com/v4/';
    this.prisma = new PrismaClient();
    this.xpiWallet = new SlpWallet('', {
      restURL: xpiRestUrl,
      hdPath: "m/44'/10605'/0'/0/0",
    });

    this.XPI = this.xpiWallet.bchjs;
    this.walletService = new WalletService(this.xpiWallet, this.XPI);
  }

  public async process(job: Job<CreateSubLixiesJobData, boolean, string>): Promise<CreateSubLixiesJobResult | boolean> {

    if (job.name === LIXI_JOB_NAMES.CREATE_SUB_LIXIES_CHUNK) {
      return processCreateSubLixiesChunk(job);
    }

    const { parentId, command } = job.data;

    return {
      id: parentId,
      name: command.name,
      jobName: LIXI_JOB_NAMES.CREATE_ALL_SUB_LIXIES,
      mnemonicHash: command.mnemonicHash,
      senderId: command.accountId,
      recipientId: command.accountId
    } as CreateSubLixiesJobResult;
  }

}