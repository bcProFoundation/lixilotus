import MinimalBCHWallet from '@bcpros/minimal-xpi-slp-wallet';
import BCHJS from '@bcpros/xpi-js';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import * as _ from 'lodash';
import { WITHDRAW_SUB_LIXIES_QUEUE } from 'src/modules/core/lixi/constants/lixi.constants';
import { WithdrawSubLixiesJobData, WithdrawSubLixiesJobResult } from 'src/modules/core/lixi/models/lixi.models';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { WalletService } from 'src/modules/wallet/wallet.service';
import { AccountCacheService } from '../../../account/account-cache.service';

@Injectable()
@Processor(WITHDRAW_SUB_LIXIES_QUEUE)
export class WithdrawSubLixiesProcessor extends WorkerHost {
  private logger: Logger = new Logger(WithdrawSubLixiesProcessor.name);
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
    @Inject('xpijs') private XPI: BCHJS,
    @Inject('xpiWallet') private xpiWallet: MinimalBCHWallet,
    private readonly accountCacheService: AccountCacheService
  ) {
    super();
  }

  public async process(job: Job<WithdrawSubLixiesJobData, boolean, string>): Promise<WithdrawSubLixiesJobResult> {
    return this.processWithdrawSubLixies(job);
  }

  public async processWithdrawSubLixies(job: Job): Promise<WithdrawSubLixiesJobResult> {
    const jobData = job.data as WithdrawSubLixiesJobData;

    const lixi = await this.prisma.lixi.findFirst({
      where: {
        id: _.toSafeInteger(jobData.parentId)
      }
    });

    const account = await this.accountCacheService.getById(_.toSafeInteger(lixi?.accountId));

    const subLixies = await this.prisma.lixi.findMany({
      where: {
        parentId: _.toSafeInteger(jobData.parentId)
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
              amount: 0,
              status: 'withdrawn'
            }
          });
        } catch (err) {
          this.logger.error(err);
          continue;
        }
      }
    }

    return {
      id: jobData.parentId,
      name: lixi?.name,
      jobName: job.name,
      mnemonicHash: account?.mnemonicHash,
      senderId: account?.id,
      recipientId: account?.id
    } as WithdrawSubLixiesJobResult;
  }
}
