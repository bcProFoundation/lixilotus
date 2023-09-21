import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import _ from 'lodash';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PageMessageSessionCacheService {
  private logger: Logger = new Logger(this.constructor.name);
  private keyPrefix = 'items:pagemessagesession';

  constructor(private readonly prisma: PrismaService, @InjectRedis() private readonly redis: Redis) {}

  async getPageMessageSessionCache(id: string) {
    const keyFields = [`latestMessage:${id}`, `latestMessageId:${id}`];
    const pageMessageSessionCache = await this.redis.hmget(this.keyPrefix, ...keyFields);
    if (_.isNil(pageMessageSessionCache[0] || _.isNil(pageMessageSessionCache[1]))) {
      // No value set yet
      const latestMessage = await this.prisma.message.findFirst({
        where: {
          pageMessageSessionId: id
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          author: true
        }
      });
      const fieldValues = new Map([
        [`latestMessage:${id}`, latestMessage?.body ?? ''],
        [`latestMessageId:${id}`, latestMessage?.id ?? ''],
        [`authorId:${id}`, latestMessage?.authorId ?? ''],
        [`authorAddress:${id}`, latestMessage?.author.address ?? '']
      ]);
      await this.redis.hmset(this.keyPrefix, fieldValues);

      return {
        latestMessage: latestMessage?.body ?? '',
        latestMessageId: latestMessage?.id ?? ''
      };
    }

    return {
      latestMessage: pageMessageSessionCache[0] ?? '',
      latestMessageId: pageMessageSessionCache[1] ?? '',
      authorId: pageMessageSessionCache[2] ?? '',
      authorAddress: pageMessageSessionCache[3] ?? ''
    };
  }

  async getMultiplePageMessageSessionCache(ids: string[]) {
    const keyFields = _.flatMap(ids, id => [
      `latestMessage:${id}`,
      `latestMessageId:${id}`,
      `authorId:${id}`,
      `authorAddress:${id}`
    ]);
    const pageMessageSessionCache = await this.redis.hmget(this.keyPrefix, ...keyFields);

    //check if there any null in pageMessageSessionCache using for loop with step of 4. Step is based on number of keyFields
    for (let i = 0; i < pageMessageSessionCache.length; i += 4) {
      if (
        _.isNil(pageMessageSessionCache[i]) ||
        _.isNil(pageMessageSessionCache[i + 1]) ||
        _.isNil(pageMessageSessionCache[i + 2]) ||
        _.isNil(pageMessageSessionCache[i + 3])
      ) {
        // No value set yet
        const latestMessage = await this.prisma.message.findFirst({
          where: {
            pageMessageSessionId: ids[i / 4]
          },
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            author: true
          }
        });
        const fieldValues = new Map([
          [`latestMessage:${ids[i / 4]}`, latestMessage?.body ?? ''],
          [`latestMessageId:${ids[i / 4]}`, latestMessage?.id ?? ''],
          [`authorId:${ids[i / 4]}`, latestMessage?.authorId ?? ''],
          [`authorAddress:${ids[i / 4]}`, latestMessage?.author.address ?? '']
        ]);
        await this.redis.hmset(this.keyPrefix, fieldValues);
      }
    }

    //return array of object with id based on ids array
    return _.chunk(pageMessageSessionCache, 4).map((item, index) => {
      return {
        id: ids[index],
        latestMessage: item[0],
        latestMessageId: item[1],
        authorId: item[2],
        authorAddress: item[3]
      };
    });

    // return _.chunk(pageMessageSessionCache, 4);
  }

  async setLatestMessage(
    pageMessageSessionId: string,
    messageId: string,
    message: string,
    authorId: string,
    authorAddress: string
  ) {
    const fieldValues = new Map([
      [`latestMessage:${pageMessageSessionId}`, message],
      [`latestMessageId:${pageMessageSessionId}`, messageId],
      [`authorId:${pageMessageSessionId}`, authorId],
      [`authorAddress:${pageMessageSessionId}`, authorAddress]
    ]);
    await this.redis.hmset(this.keyPrefix, fieldValues);
  }

  async removeLatestMessage(pageMessageSessionId: string) {
    const fieldValues = [
      `latestMessage:${pageMessageSessionId}`,
      `latestMessageId:${pageMessageSessionId}`,
      `authorId:${pageMessageSessionId}`,
      `authorAddress:${pageMessageSessionId}`
    ];
    await this.redis.hdel(this.keyPrefix, ...fieldValues);
  }
}
