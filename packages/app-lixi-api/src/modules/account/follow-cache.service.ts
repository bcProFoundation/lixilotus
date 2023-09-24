import _ from 'lodash';
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
    const followers = await this.redis.zrevrange(key, 0, -1);
    return followers.map(follower => _.toSafeInteger(follower));
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

    if (_.isNil(promises) || promises.length === 0) return null;

    return Promise.all(promises);
  }

  async getAccountFollowings(accountId: number) {
    const key = `user:${accountId}:followings`;
    const exist = await this.redis.exists([key]);
    if (!exist) {
      await this._cacheAccountFollowings(key, accountId);
    }
    const followings = await this.redis.zrevrange(key, 0, -1);
    return followings.map(following => _.toSafeInteger(following));
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
    const followers = await this.redis.zrevrange(key, 0, -1);
    return followers.map(follower => _.toSafeInteger(follower));
  }

  private async _cachePageFollowingOfAccount(key: string, accountId: number) {
    const followings = await this.prisma.followPage.findMany({
      where: {
        AND: [{ accountId: accountId }, { pageId: { not: null } }]
      }
    });

    const promises = [];
    for (const following of followings) {
      promises.push(this.redis.zadd(key, following.createdAt.getTime(), following.pageId!));
    }

    if (_.isNil(promises) || promises.length === 0) return null;

    return Promise.all(promises);
  }

  async getPageFollowings(accountId: number) {
    const key = `user:${accountId}:followingPages`;
    const exist = await this.redis.exists([key]);
    if (!exist) {
      await this._cachePageFollowingOfAccount(key, accountId);
    }
    return await this.redis.zrevrange(key, 0, -1);
  }

  private async _cacheTokenFollowingOfAccount(key: string, accountId: number) {
    const followings = await this.prisma.followPage.findMany({
      where: {
        AND: [{ accountId: accountId }, { tokenId: { not: null } }]
      }
    });

    const promises = [];
    for (const following of followings) {
      promises.push(this.redis.zadd(key, following.createdAt.getTime(), following.tokenId!));
    }

    if (_.isNil(promises) || promises.length === 0) return null;

    return Promise.all(promises);
  }

  async getTokenFollowings(accountId: number) {
    const key = `user:${accountId}:followingTokens`;
    const exist = await this.redis.exists([key]);
    if (!exist) {
      await this._cacheTokenFollowingOfAccount(key, accountId);
    }
    return await this.redis.zrevrange(key, 0, -1);
  }

  async checkIfAccountFollowPage(accountId: number, pageId: string) {
    const key = `user:${accountId}:followingPages`;
    const exist = await this.redis.exists([key]);
    if (!exist) {
      await this._cachePageFollowingOfAccount(key, accountId);
    }
    return !!(await this.redis.zscore(key, pageId));
  }

  async checkIfAccountFollowToken(accountId: number, tokenId: string) {
    const key = `user:${accountId}:followingTokens`;
    const exist = await this.redis.exists([key]);
    if (!exist) {
      await this._cacheTokenFollowingOfAccount(key, accountId);
    }
    return !!(await this.redis.zscore(key, tokenId));
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

  async removeFollowToken(followerAccountId: number, tokenId: string) {
    const keyFollowers = `token:${tokenId}:followers`;
    const keyFollowings = `user:${followerAccountId}:followingTokens`;

    return Promise.all([this.redis.zrem(keyFollowers, followerAccountId), this.redis.zrem(keyFollowings, tokenId)]);
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

  async createFollowToken(followerAccountId: number, tokenId: string, createdAt: Date) {
    const keyFollowers = `token:${tokenId}:followers`;
    const keyFollowings = `user:${followerAccountId}:followingTokens`;

    return Promise.all([
      this.redis.zadd(keyFollowers, createdAt.getTime(), followerAccountId),
      this.redis.zadd(keyFollowings, createdAt.getTime(), tokenId)
    ]);
  }

  async checkAccountFollowAllAccount(followerAccountId: number, followingAccountIds: number[]) {
    const key = `user:${followerAccountId}:followings`;
    const exist = await this.redis.exists([key]);
    let accountHaveFollowing;
    let listCheckAccountFollowAccounts: boolean[] | (string | null)[] = [];

    if (!exist) {
      accountHaveFollowing = await this._cacheAccountFollowings(key, followerAccountId);
    }
    if (accountHaveFollowing === null) {
      followingAccountIds.forEach((item, index) => {
        listCheckAccountFollowAccounts[index] = false;
      });
      return listCheckAccountFollowAccounts;
    }

    listCheckAccountFollowAccounts = await this.redis.zmscore(key, ...followingAccountIds);
    return listCheckAccountFollowAccounts;
  }

  async checkAccountFollowAllPage(followerAccountId: number, pageIds: string[]) {
    const key = `user:${followerAccountId}:followingPages`;
    const exist = await this.redis.exists([key]);
    let accountHaveFollowingPage;
    let listCheckAccountFollowPages: boolean[] | (string | null)[] = [];

    if (!exist) {
      accountHaveFollowingPage = await this._cachePageFollowingOfAccount(key, followerAccountId);
    }
    if (accountHaveFollowingPage === null) {
      pageIds.forEach((item, index) => {
        listCheckAccountFollowPages[index] = false;
      });
      return listCheckAccountFollowPages;
    }

    listCheckAccountFollowPages = await this.redis.zmscore(key, ...pageIds);
    return listCheckAccountFollowPages;
  }

  async checkAccountFollowAllToken(followerAccountId: number, tokenIds: string[]) {
    const key = `user:${followerAccountId}:followingTokens`;
    const exist = await this.redis.exists([key]);
    let accountHaveFollowingToken;
    let listCheckAccountFollowTokens: boolean[] | (string | null)[] = [];

    if (!exist) {
      accountHaveFollowingToken = await this._cacheTokenFollowingOfAccount(key, followerAccountId);
    }
    if (accountHaveFollowingToken === null) {
      tokenIds.forEach((item, index) => {
        listCheckAccountFollowTokens[index] = false;
      });
      return listCheckAccountFollowTokens;
    }

    listCheckAccountFollowTokens = await this.redis.zmscore(key, ...tokenIds);
    return listCheckAccountFollowTokens;
  }
}
