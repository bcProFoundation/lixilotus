import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import _ from 'lodash';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountDanaCacheService {
  private logger: Logger = new Logger(this.constructor.name);
  private keyPrefix = 'items:accountdana';

  constructor(private readonly prisma: PrismaService, @InjectRedis() private readonly redis: Redis) {}

  async getAccountDana(id: number) {
    const keyFields = [`danaGiven:${id}`, `danaReceived:${id}`];
    const accountDana = await this.redis.hmget(this.keyPrefix, ...keyFields);
    if (_.isNil(accountDana[0] || _.isNil(accountDana[1]))) {
      // No value set yet
      const dbValue = await this.prisma.accountDana.findUnique({
        where: {
          accountId: id
        }
      });
      const fieldValues = new Map([
        [`danaGiven:${id}`, dbValue?.danaGiven ?? 0],
        [`danaReceived:${id}`, dbValue?.danaReceived ?? 0]
      ]);
      await this.redis.hmset(this.keyPrefix, fieldValues);

      return {
        danaGiven: dbValue?.danaGiven ?? 0,
        danaReceived: dbValue?.danaReceived ?? 0
      };
    }
    return {
      danaGiven: accountDana[0] ?? 0,
      danaReceived: accountDana[1] ?? 0
    };
  }

  async incrDanaGivenBy(id: number, value: number) {
    const keyField = `danaGiven:${id}`;
    await this.redis.hincrby(this.keyPrefix, keyField, value);
  }

  async incrDanaReceivedBy(id: number, value: number) {
    const keyField = `danaReceived:${id}`;
    await this.redis.hincrby(this.keyPrefix, keyField, value);
  }

  async setDanaGiven(id: number, value: number) {
    const keyField = `danaGiven:${id}`;
    await this.redis.hset(this.keyPrefix, keyField, value);
  }

  async setDanaReceived(id: number, value: number) {
    const keyField = `danaReceived:${id}`;
    await this.redis.hset(this.keyPrefix, keyField, value);
  }
}
