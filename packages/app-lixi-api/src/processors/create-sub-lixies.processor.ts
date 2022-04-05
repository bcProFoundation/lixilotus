import { CreateLixiCommand, fromSmallestDenomination, Lixi, LixiType } from '@bcpros/lixi-models';
import MinimalBCHWallet from '@bcpros/minimal-xpi-slp-wallet';
import BCHJS from '@bcpros/xpi-js';
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Injectable } from "@nestjs/common";
import { Lixi as LixiDb, PrismaClient } from '@prisma/client';
import { Job } from "bullmq";
import * as _ from 'lodash';
import { CREATE_SUB_LIXIES_QUEUE } from 'src/constants/lixi.constants';
import logger from 'src/logger';
import { CreateSubLixiesChunkJobData, CreateSubLixiesJobData, MapEncryptedClaimCode } from "src/models/lixi.models";
import { PrismaService } from 'src/services/prisma/prisma.service';
import { WalletService } from 'src/services/wallet.service';
import { aesGcmEncrypt, generateRandomBase58Str, numberToBase58 } from 'src/utils/encryptionMethods';
import { VError } from 'verror';
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