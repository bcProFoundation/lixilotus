import { BurnForType, IPaginatedType } from '@bcpros/lixi-models';
import { Prisma } from '@bcpros/lixi-prisma';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import _ from 'lodash';
import moment from 'moment';
import { I18n, I18nService } from 'nestjs-i18n';
import { FollowCacheService } from '../account/follow-cache.service';
import { PrismaService } from '../prisma/prisma.service';
import SortedSet from 'redis-sorted-set';

@Injectable()
export class TimelineService {
  private logger: Logger = new Logger(this.constructor.name);

  static inNetworkSourceKey = 'timeline:innetworksource';
  static outNetworkSourceKey = 'timeline:outnetworksource';
  static ratioSteps = [0.1, 0.3, 0.5, 0.7, 0.9];

  constructor(
    private readonly prisma: PrismaService,
    private readonly followCacheService: FollowCacheService,
    @InjectRedis() private readonly redis: Redis,
    @I18n() private i18n: I18nService
  ) {}

  async cacheInNetworkByTime(accountId: number) {
    const key = `${TimelineService.inNetworkSourceKey}:${accountId}`;
    try {
      const accountFollowings = (await this.followCacheService.getAccountFollowings(accountId)).map(item =>
        _.toSafeInteger(item)
      );
      const pageFollowings = await this.followCacheService.getPageFollowings(accountId);
      // get all the post of the following accounts, order by time
      const posts = await this.prisma.post.findMany({
        select: {
          id: true,
          postAccountId: true,
          createdAt: true
        },
        where: {
          OR: [
            {
              pageId: {
                in: pageFollowings
              }
            },
            {
              postAccountId: {
                in: [accountId].concat(accountFollowings)
              }
            }
          ]
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 500
      });

      const epoch = '2023-01-01 00:00:00';
      const pipeline = this.redis.pipeline();
      for (const post of posts) {
        const id = `${post.id}`;

        const diffHour = moment.duration(moment(post.createdAt).diff(moment(epoch))).asHours();
        const score = 10 * Math.pow(2, diffHour / 12);
        pipeline.zincrby(key, score, id);
      }
      pipeline.expire(key, 2592000);
      await pipeline.exec();
    } catch (err) {
      this.logger.error(err);
    }
  }

  async cacheInNetworkByScore(accountId: number) {
    const key = `${TimelineService.inNetworkSourceKey}:${accountId}`;
    const postBurnType = BurnForType.Post;
    const epoch = '2023-01-01 00:00:00';
    const halfLife = '12 hours';
    try {
      const accountFollowings = (await this.followCacheService.getAccountFollowings(accountId)).map(item =>
        _.toSafeInteger(item)
      );
      const pageFollowings = await this.followCacheService.getPageFollowings(accountId);

      if (
        (_.isNil(accountFollowings) || _.isEmpty(accountFollowings)) &&
        (_.isNil(pageFollowings) || _.isEmpty(pageFollowings))
      )
        return;

      const posts = await this.prisma.$queryRaw<{ id: string; score: number }[]>(
        Prisma.sql`
            SELECT
              post.id,
              total_relevance(relevance_score(burn.burn_type, burn.created_at, ${epoch} :: timestamp, ${halfLife} :: interval, burn.burned_value)) AS score 
            FROM
              post 
              JOIN
                  burn 
                  ON post.id = burn.burned_for_id 
            WHERE
              burn.burn_for_type = ${postBurnType} 
              AND burn.burned_value > 0 
              AND (
                (post.post_account_id IN ${Prisma.join([accountId].concat(accountFollowings))} ) OR
                (post.page_id) IN ${Prisma.join(pageFollowings)}
              )
            GROUP BY
              post.id 
            ORDER by
              score desc
            LIMIT 500;
          `
      );

      const pipeline = this.redis.pipeline();
      for (const post of posts) {
        const id = `${post.id}`;
        pipeline.zincrby(key, post.score, id);
      }
      pipeline.expire(key, 2592000);
      await pipeline.exec();
    } catch (err) {
      this.logger.error(err);
    }
  }

  async getInNetwork(accountId: number) {
    const key = `${TimelineService.inNetworkSourceKey}:${accountId}`;
    const exist = await this.redis.exists([key]);

    if (!exist) {
      // build ranking items
      await this.cacheInNetworkByTime(accountId);
      await this.cacheInNetworkByScore(accountId);
    }

    return await this.redis.zrevrange(key, 0, -1, 'WITHSCORES');
  }

  async cacheOutNetwork() {
    const key = TimelineService.outNetworkSourceKey;
    const postBurnType = BurnForType.Post;
    const epoch = '2023-01-01 00:00:00';
    const halfLife = '12 hours';
    try {
      const posts = await this.prisma.$queryRaw<{ id: string; score: number }[]>(
        Prisma.sql`
            SELECT
              post.id,
              total_relevance(relevance_score(burn.burn_type, burn.created_at, ${epoch} :: timestamp, ${halfLife} :: interval, burn.burned_value)) AS score 
            FROM
              post 
              JOIN
                  burn 
                  ON post.id = burn.burned_for_id 
            WHERE
              burn.burn_for_type = ${postBurnType} 
              AND burn.burned_value > 0 
            GROUP BY
              post.id 
            ORDER by
              score desc
            LIMIT 1000;
          `
      );

      const pipeline = this.redis.pipeline();
      for (const post of posts) {
        const id = `${post.id}`;
        pipeline.zadd(key, post.score, id);
      }
      pipeline.expire(key, 2592000);
      await pipeline.exec();
    } catch (err) {
      this.logger.error(err);
    }
  }

  async getOutNetwork() {
    const key = TimelineService.outNetworkSourceKey;
    const exist = await this.redis.exists([key]);

    if (!exist) {
      await this.cacheOutNetwork();
    }

    return await this.redis.zrevrange(key, 0, -1, 'WITHSCORES');
  }

  private mergeByRatio(arr1: string[], arr2: string[], ratio: number): string[] {
    if (ratio < 0 || ratio > 1) {
      throw new Error('Ratio should be between 0 and 1');
    }

    const gcd = (x: number, y: number) => {
      x = Math.abs(x);
      y = Math.abs(y);
      while (y) {
        const t = y;
        y = x % y;
        x = t;
      }
      return x;
    };

    // find the gcd from ratio
    const numOfArr1In10Items = Math.round(ratio * 10);
    const numOfArr2In10Items = 10 - numOfArr1In10Items;

    // Reduce to fraction
    const gcdValue = gcd(numOfArr1In10Items, numOfArr2In10Items);
    const numOfArr1ItemsEachBatch = numOfArr1In10Items / gcdValue;
    const numOfArr2ItemsEachBatch = numOfArr2In10Items / gcdValue;

    const result: string[] = [];
    const seen = new Set<string>();

    let i = 0,
      j = 0,
      k = 0;

    while (i < arr1.length && j < arr2.length) {
      const numOfItemsToInsertFromArr1 = Math.min(numOfArr1ItemsEachBatch, arr1.length - i);
      const numOfItemsToInsertFromArr2 = Math.min(numOfArr2ItemsEachBatch, arr2.length - j);

      k = 0;
      let index1 = 0; // the index to track pointer moving in arr1
      while (k < numOfItemsToInsertFromArr1 && i + index1 < arr1.length) {
        const item1 = arr1[i + index1];
        if (!seen.has(item1) && !_.isNil(item1)) {
          seen.add(item1);
          result.push(item1);
          k += 1;
        }
        index1 += 1;
      }
      i += numOfItemsToInsertFromArr1;

      k = 0;
      let index2 = 0; // the index to track pointer moving in arr2
      while (k < numOfItemsToInsertFromArr2 && j + index2 < arr2.length) {
        const item2 = arr2[j + index2];
        if (!seen.has(item2)) {
          seen.add(item2);
          result.push(item2);
          k += 1;
        }
        index2 += 1;
      }
      j += numOfItemsToInsertFromArr2;
    }

    if (i < arr1.length) {
      for (; i < arr1.length; i++) {
        const item = arr1[i];
        if (!seen.has(item)) {
          seen.add(item);
          result.push(item);
        }
      }
    } else if (j < arr2.length) {
      for (; j < arr2.length; j++) {
        const item = arr2[j];
        if (!seen.has(item)) {
          seen.add(item);
          result.push(item);
        }
      }
    }

    return result;
  }

  async getTimelineIdsByLevel(
    level: number,
    accountId?: number,
    first: number = 20,
    after?: string
  ): Promise<IPaginatedType<string>> {
    if (level < 1 || level > 5) {
      throw new Error('Level should be between 1 and 5');
    }

    const ratio = TimelineService.ratioSteps[level - 1];

    const timelineSortedSet = new SortedSet();
    const inNetworkWithScores = accountId ? (await this.getInNetwork(accountId)) || [] : [];
    const outNetworkWithScores = await this.getOutNetwork();

    const maxScoreInNetwork = inNetworkWithScores.length > 1 ? inNetworkWithScores[1] : 0;
    const maxScoreOutNetwork = outNetworkWithScores.length > 1 ? outNetworkWithScores[1] : 0;

    const inNetwork = inNetworkWithScores.filter((item, index) => index % 2 === 0);
    const outNetwork = outNetworkWithScores.filter((item, index) => index % 2 === 0);

    const timeline =
      _.toNumber(maxScoreInNetwork) > _.toNumber(maxScoreOutNetwork)
        ? this.mergeByRatio(_.compact(inNetwork), _.compact(outNetwork), _.round(ratio, 1))
        : this.mergeByRatio(_.compact(outNetwork), _.compact(inNetwork), _.round(1 - ratio, 1));

    let index = 0;
    for (const id of timeline) {
      timelineSortedSet.add(id, index);
      index += 1;
    }

    const totalCount = timelineSortedSet.length;
    if (after) {
      const startOffset = timelineSortedSet.rank(after);
      if (startOffset === null) {
        // Cannot find cursor in the sorted set
        return {
          totalCount,
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: true,
            startCursor: after
          }
        };
      } else {
        const endOffset = startOffset + first;
        const ids: string[] = await timelineSortedSet.range(startOffset + 1, startOffset + first);
        const edges = ids.map((value, index) => {
          return {
            cursor: value,
            node: value
          };
        });
        const firstEdge = edges[0];
        const lastEdge = edges[edges.length - 1];
        return {
          totalCount,
          edges,
          pageInfo: {
            startCursor: firstEdge ? firstEdge.cursor : undefined,
            endCursor: lastEdge ? lastEdge.cursor : undefined,
            hasPreviousPage: true,
            hasNextPage: endOffset < totalCount
          }
        };
      }
    } else {
      // Get data from start
      const startOffset = 0;
      const endOffset = startOffset + first;
      const ids: string[] = timelineSortedSet.range(startOffset, startOffset + first - 1);
      const edges = ids.map((value, index) => {
        return {
          cursor: value,
          node: value
        };
      });
      const firstEdge = edges[0];
      const lastEdge = edges[edges.length - 1];
      return {
        totalCount,
        edges,
        pageInfo: {
          startCursor: firstEdge ? firstEdge.cursor : undefined,
          endCursor: lastEdge ? lastEdge.cursor : undefined,
          hasPreviousPage: true,
          hasNextPage: endOffset < totalCount
        }
      };
    }
  }
}
