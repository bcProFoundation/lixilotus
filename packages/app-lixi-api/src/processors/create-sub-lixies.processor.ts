import MinimalBCHWallet from '@bcpros/minimal-xpi-slp-wallet';
import BCHJS from '@bcpros/xpi-js';
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { PrismaClient } from '@prisma/client';
import { Job } from "bullmq";
import * as _ from 'lodash';
import { CREATE_SUB_LIXIES_QUEUE } from 'src/constants/lixi.constants';
import { CreateSubLixiesJobData } from "src/models/lixi.models";
import { WalletService } from 'src/services/wallet.service';
import config from 'config';
import SlpWallet from '@bcpros/minimal-xpi-slp-wallet';
import { processCreateSubLixiesChunk } from './create-sub-lixies.isolated.processor';

// @Injectable()
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

  public async process(job: Job<CreateSubLixiesJobData, boolean, string>): Promise<boolean> {

    if (job.name === 'create-sub-lixies-chunk') {
      return processCreateSubLixiesChunk(job);
    }

    return true;
  }


}