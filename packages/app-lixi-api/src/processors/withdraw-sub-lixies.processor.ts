import MinimalBCHWallet from '@bcpros/minimal-xpi-slp-wallet';
import BCHJS from '@bcpros/xpi-js';
import { OnQueueEvent, OnWorkerEvent, Processor, QueueEventsHost, QueueEventsListener, WorkerHost } from "@nestjs/bullmq";
import { Inject, Injectable } from "@nestjs/common";
import { Lixi as LixiDb, prisma, PrismaClient } from '@prisma/client';
import { Job } from "bullmq";
import * as _ from 'lodash';
import { WITHDRAW_SUB_LIXIES_QUEUE } from 'src/constants/lixi.constants';
import logger from 'src/logger';
import { WithdrawSubLixiesJobData } from "src/models/lixi.models";
import { PrismaService } from 'src/services/prisma/prisma.service';
import { WalletService } from 'src/services/wallet.service';

@Injectable()
@Processor(WITHDRAW_SUB_LIXIES_QUEUE)
export class WithdrawSubLixiesProcessor extends WorkerHost {

  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
    @Inject('xpijs') private XPI: BCHJS,
    @Inject('xpiWallet') private xpiWallet: MinimalBCHWallet
  ) {
    super();
  }

  public async process(job: Job<WithdrawSubLixiesJobData, boolean, string>): Promise<boolean> {
    if (job.name === 'withdraw-all-sub-lixies') {
      return this.processWithdrawSubLixies(job);
    }
    return true;
  }

  public async processWithdrawSubLixies(job: Job): Promise<boolean> {
    const jobData = job.data as WithdrawSubLixiesJobData;
  
    const subLixies = await this.prisma.lixi.findMany({
      where: {
        parentId: jobData.parentId,
      }
    });

    const mnemonic = jobData.mnemonic;
    for (let item in subLixies) {
      const subLixiAddress = subLixies[item].address;
      const subLixiDerivationIndex = subLixies[item].derivationIndex;
  
      const subLixiIndex = subLixiDerivationIndex;
      const { keyPair } = await this.walletService.deriveAddress(mnemonic, subLixiIndex);

      const subLixiBalance: number = await this.xpiWallet.getBalance(subLixiAddress);
      
      if (subLixiBalance !== 0) {
        try {
          const totalAmount: number = await this.walletService.onMax(subLixiAddress);
          const receivingAccount = [{ address: jobData.accountAddress, amountXpi: totalAmount }];
          const amount: any = await this.walletService.sendAmount(subLixiAddress, receivingAccount, keyPair);
    
          const updatedSubLixies = await this.prisma.lixi.update({
            where: {
              id: subLixies[item].id
            },
            data: {
              amount: 0
            }
          });
        } catch (err) {
          logger.error(err);
          continue;
        }
      }
    }
    return true;
  }
}
