import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Redis } from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { ACCOUNT_DANA_QUEUE } from './burn.constants';
import { AccountDanaHistoryType, BurnType as BurnTypePrisma } from '@bcpros/lixi-prisma';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { BurnCommand, BurnType } from '@bcpros/lixi-models';
import { AccountDanaCacheService } from '../../account/account-dana-cache.service';

@Injectable()
@Processor(ACCOUNT_DANA_QUEUE, { concurrency: 1 })
export class AccountDanaProcessor extends WorkerHost {
  private logger: Logger = new Logger(this.constructor.name);

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly prisma: PrismaService,
    private readonly accountDanaCacheService: AccountDanaCacheService
  ) {
    super();
  }

  public async process(
    job: Job<
      { command: BurnCommand; txid: string; amount: number; givenDanaAddress: string; receivedDanaAddress: string },
      boolean,
      string
    >
  ) {
    try {
      const { amount, command, givenDanaAddress, receivedDanaAddress, txid } = job.data;

      //Check if self burn
      if (givenDanaAddress === receivedDanaAddress) {
        const accountDana = await this.prisma.accountDana.findFirst({
          where: {
            account: {
              address: givenDanaAddress
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        await this.prisma.$transaction(async prisma => {
          let givenUpValue = 0.0;
          let givenDownValue = 0.0;

          switch (command.burnType) {
            case BurnType.Up:
              givenUpValue = amount;
              break;
            case BurnType.Down:
              givenDownValue = amount;
              break;
          }

          const danaGiven = accountDana?.danaGiven! + amount;

          const updatedAccountDana = await prisma.accountDana.update({
            where: {
              id: accountDana?.id
            },
            data: {
              danaGiven: danaGiven
            }
          });

          await prisma.accountDanaHistory.create({
            data: {
              txid: txid,
              burnType: command.burnType ? BurnTypePrisma.UPVOTE : BurnTypePrisma.DOWNVOTE,
              accountDana: {
                connect: {
                  id: updatedAccountDana?.id
                }
              },
              burnForId: command.burnForId,
              burnForType: command.burnForType,
              type: AccountDanaHistoryType.GIVEN,
              givenUpValue: givenUpValue,
              givenDownValue: givenDownValue
            }
          });
        });

        if (accountDana && accountDana?.accountId) {
          await this.accountDanaCacheService.incrDanaGivenBy(accountDana?.accountId, amount);
        }
      } else {
        const givenAccountDana = await this.prisma.accountDana.findFirst({
          where: {
            account: {
              address: givenDanaAddress
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        //update received account
        const receivedAccountDana = await this.prisma.accountDana.findFirst({
          where: {
            account: {
              address: receivedDanaAddress
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        await this.prisma.$transaction(async prisma => {
          let givenUpValue = 0.0;
          let givenDownValue = 0.0;
          let receivedUpValue = 0.0;
          let receivedDownValue = 0.0;

          switch (command.burnType) {
            case BurnType.Up:
              givenUpValue = amount;
              receivedUpValue = amount;
              break;
            case BurnType.Down:
              givenDownValue = amount;
              receivedDownValue = amount;
              break;
          }

          const danaGiven = givenAccountDana?.danaGiven! + amount;

          const updatedGivenAccountDana = await prisma.accountDana.update({
            where: {
              id: givenAccountDana?.id
            },
            data: {
              danaGiven: danaGiven
            }
          });

          await prisma.accountDanaHistory.create({
            data: {
              txid: txid,
              burnType: command.burnType ? BurnTypePrisma.UPVOTE : BurnTypePrisma.DOWNVOTE,
              accountDana: {
                connect: {
                  id: updatedGivenAccountDana?.id
                }
              },
              burnForId: command.burnForId,
              burnForType: command.burnForType,
              type: AccountDanaHistoryType.GIVEN,
              givenUpValue: givenUpValue,
              givenDownValue: givenDownValue
            }
          });

          const danaReceived =
            command.burnType === BurnType.Up
              ? receivedAccountDana?.danaReceived! + amount
              : receivedAccountDana?.danaReceived! - amount;

          const updatedRecivedAccountDana = await prisma.accountDana.update({
            where: {
              id: receivedAccountDana?.id
            },
            data: {
              danaReceived: danaReceived
            }
          });

          await prisma.accountDanaHistory.create({
            data: {
              txid: txid,
              burnType: command.burnType ? BurnTypePrisma.UPVOTE : BurnTypePrisma.DOWNVOTE,
              accountDana: {
                connect: {
                  id: updatedRecivedAccountDana?.id
                }
              },
              burnForId: command.burnForId,
              burnForType: command.burnForType,
              type: AccountDanaHistoryType.RECEIVED,
              receivedUpValue: receivedUpValue,
              receivedDownValue: receivedDownValue
            }
          });
        });

        if (givenAccountDana && givenAccountDana?.accountId) {
          await this.accountDanaCacheService.incrDanaGivenBy(givenAccountDana?.accountId, amount);
        }
        if (receivedAccountDana && receivedAccountDana?.accountId) {
          const value = command.burnType == BurnType.Up ? amount : -1 * amount;
          await this.accountDanaCacheService.incrDanaReceivedBy(receivedAccountDana?.accountId, value);
        }
      }
    } catch (error) {
      this.logger.error(error);
      return false;
    }
    return true;
  }
}
