import _ from 'lodash';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { PrismaService } from '../prisma/prisma.service';
import { Account } from '@bcpros/lixi-prisma';
import ItemRepository from '../../common/redis/repository';

@Injectable()
export class AccountCacheService {
  private logger: Logger = new Logger(this.constructor.name);

  private accountRepository: ItemRepository<Account>;

  constructor(private readonly prisma: PrismaService, @InjectRedis() private readonly redis: Redis) {
    this.accountRepository = new ItemRepository<Account>('accounts', this.redis);
  }

  async getById(id: number) {
    const account = await this.accountRepository.getById(id);
    if (_.isNil(account)) {
      const dbAccount = await this.prisma.account.findUnique({
        where: {
          id: _.toSafeInteger(id)
        },
        include: {
          avatar: {
            include: {
              upload: true
            }
          },
          cover: {
            include: {
              upload: true
            }
          }
        }
      });

      if (dbAccount) {
        await this.accountRepository.set(dbAccount, 600);
      }
      return dbAccount;
    }
    return account;
  }

  async deleteById(id: number) {
    await this.accountRepository.deleteById(id);
  }

  async set(account: Account, expirationInSeconds: number = 600) {
    await this.accountRepository.set(account, expirationInSeconds);
  }
}
