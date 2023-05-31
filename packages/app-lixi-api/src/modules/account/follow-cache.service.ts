import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowCacheService {
  private logger: Logger = new Logger(this.constructor.name);

  constructor(private readonly prisma: PrismaService, @InjectRedis() private readonly redis: Redis) {}

  private async _cacheAccountFollowers(key: string, accountId: number) {
    const followers = await this.prisma.followAccount.findMany({
      where: {
        followingAccountId: accountId
      }
    });

    const promises = [];
    for (const follower of followers) {
      promises.push(this.redis.zadd(key, follower.createdAt.getTime(), follower.followerAccountId));
    }
    return Promise.all(promises);
  }

  async getAccountFollowers(accountId: number) {
    const key = `user:${accountId}:followers`;
    const exist = await this.redis.exists([key]);
    if (!exist) {
      await this._cacheAccountFollowers(key, accountId);
    }
    return await this.redis.zrevrange(key, 0, -1, 'WITHSCORES');
  }

  private async _cacheAccountFollowings(key: string, accountId: number) {
    const followings = await this.prisma.followAccount.findMany({
      where: {
        followerAccountId: accountId
      }
    });

    const promises = [];
    for (const following of followings) {
      promises.push(this.redis.zadd(key, following.createdAt.getTime(), following.followingAccountId));
    }
    return Promise.all(promises);
  }

  async getAccountFollowings(accountId: number) {
    const key = `user:${accountId}:followings`;
    const exist = await this.redis.exists([key]);
    if (!exist) {
      await this._cacheAccountFollowings(key, accountId);
    }
    return await this.redis.zrevrange(key, 0, -1, 'WITHSCORES');
  }

  private async _cachePageFollowers(key: string, pageId: string) {
    const followers = await this.prisma.followPage.findMany({
      where: {
        pageId: pageId
      }
    });

    const promises = [];
    for (const follower of followers) {
      promises.push(this.redis.zadd(key, follower.createdAt.getTime(), follower.accountId));
    }

    await Promise.all(promises);
  }

  async getPageFollowers(pageId: string) {
    const key = `page:${pageId}:followers`;
    const exist = await this.redis.exists([key]);
    if (!exist) {
      await this._cachePageFollowers(key, pageId);
    }
    return await this.redis.zrevrange(key, 0, -1, 'WITHSCORES');
  }

  private async _cachePageFollowingOfAccount(key: string, accountId: number) {
    const followings = await this.prisma.followPage.findMany({
      where: {
        accountId: accountId
      }
    });

    const promises = [];
    for (const following of followings) {
      promises.push(this.redis.zadd(key, following.createdAt.getTime(), following.pageId));
    }

    return Promise.all(promises);
  }

  async getPageFollowings(accountId: number) {
    const key = `user:${accountId}:followingPages`;
    const exist = await this.redis.exists([key]);
    if (!exist) {
      await this._cachePageFollowingOfAccount(key, accountId);
    }
    return await this.redis.zrevrange(key, 0, -1, 'WITHSCORES');
  }

  async checkIfAccountFollowPage(accountId: number, pageId: string) {
    const key = `user:${accountId}:followingPages`;
    const exist = await this.redis.exists([key]);
    if (!exist) {
      await this._cachePageFollowingOfAccount(key, accountId);
    }
    return !!(await this.redis.zscore(key, pageId));
  }

  async checkIfAccountFollowAccount(followerAccountId: number, followingAccountId: number) {
    const key = `user:${followerAccountId}:followings`;
    const exist = await this.redis.exists([key]);
    if (!exist) {
      await this._cacheAccountFollowings(key, followerAccountId);
    }

    return !!(await this.redis.zscore(key, followingAccountId));
  }

  async removeFollowAccount(followerAccountId: number, followingAccountId: number) {
    const keyFollowers = `user:${followingAccountId}:followers`;
    const keyFollowings = `user:${followerAccountId}:followings`;
    return Promise.all([
      this.redis.zrem(keyFollowers, followerAccountId),
      this.redis.zrem(keyFollowings, followingAccountId)
    ]);
  }

  async removeFollowPage(followerAccountId: number, pageId: string) {
    const keyFollowers = `page:${pageId}:followers`;
    const keyFollowings = `user:${followerAccountId}:followingPages`;

    return Promise.all([this.redis.zrem(keyFollowers, followerAccountId), this.redis.zrem(keyFollowings, pageId)]);
  }

  async createFollowAccount(followerAccountId: number, followingAccountId: number, createdAt: Date) {
    const keyFollowers = `user:${followingAccountId}:followers`;
    const keyFollowings = `user:${followerAccountId}:followings`;

    return Promise.all([
      this.redis.zadd(keyFollowers, createdAt.getTime(), followerAccountId),
      this.redis.zadd(keyFollowings, createdAt.getTime(), followingAccountId)
    ]);
  }

  async createFollowPage(followerAccountId: number, pageId: string, createdAt: Date) {
    const keyFollowers = `page:${pageId}:followers`;
    const keyFollowings = `user:${followerAccountId}:followingPages`;

    return Promise.all([
      this.redis.zadd(keyFollowers, createdAt.getTime(), followerAccountId),
      this.redis.zadd(keyFollowings, createdAt.getTime(), pageId)
    ]);
  }
}
