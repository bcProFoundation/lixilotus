import {
  Account,
  AccountConnection,
  AccountOrder,
  CreateFollowAccountInput,
  CreateFollowPageInput,
  CreateFollowTokenInput,
  DeleteFollowAccountInput,
  DeleteFollowPageInput,
  DeleteFollowTokenInput,
  FollowAccount,
  FollowPage,
  FollowPageConnection,
  PaginationArgs
} from '@bcpros/lixi-models';
import { NotificationLevel } from '@bcpros/lixi-prisma';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpException, HttpStatus, Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { SkipThrottle } from '@nestjs/throttler';
import { PubSub } from 'graphql-subscriptions';
import { Redis } from 'ioredis';
import _ from 'lodash';
import { I18n, I18nService } from 'nestjs-i18n';
import { NOTIFICATION_TYPES } from 'src/common/modules/notifications/notification.constants';
import { NotificationService } from 'src/common/modules/notifications/notification.service';
import { AccountEntity } from 'src/decorators/account.decorator';
import { PageAccountEntity } from 'src/decorators/pageAccount.decorator';
import { GqlHttpExceptionFilter } from 'src/middlewares/gql.exception.filter';
import VError from 'verror';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwtauth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { AccountCacheService } from './account-cache.service';
import { FollowCacheService } from './follow-cache.service';

const pubSub = new PubSub();

@SkipThrottle()
@Resolver(() => FollowAccount)
@UseFilters(GqlHttpExceptionFilter)
export class FollowResolver {
  private logger: Logger = new Logger(FollowResolver.name);

  constructor(
    private readonly followCacheService: FollowCacheService,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    @I18n() private readonly i18n: I18nService,
    @InjectRedis() private readonly redis: Redis,
    private readonly accountCacheService: AccountCacheService
  ) {}

  @Subscription(() => FollowAccount)
  followAccountCreated() {
    return pubSub.asyncIterator('followAccountCreated');
  }

  @Query(() => Boolean)
  @UseGuards(GqlJwtAuthGuard)
  async checkIfFollowAccount(
    @AccountEntity() account: Account,
    @Args('followingAccountId', { type: () => Int }) followingAccountId: number
  ) {
    if (!account) {
      return false;
    }

    return await this.followCacheService.checkIfAccountFollowAccount(account.id, followingAccountId);
  }

  @Query(() => AccountConnection)
  @UseGuards(GqlJwtAuthGuard)
  async allFollowingsByFollower(
    @AccountEntity() account: Account,
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'followerAccountId', type: () => Number, nullable: true })
    followerAccountId: number,
    @Args({
      name: 'orderBy',
      type: () => AccountOrder,
      nullable: true
    })
    orderBy: AccountOrder
  ) {
    const result = await findManyCursorConnection(
      paginationArgs =>
        this.prisma.followAccount
          .findMany({
            where: {
              followerAccountId: followerAccountId
            },
            include: {
              followingAccount: true
            },
            orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
            ...paginationArgs
          })
          .then(followings => followings.map(following => following.followingAccount)),
      () =>
        this.prisma.followAccount.count({
          where: {
            followerAccountId: followerAccountId
          }
        }),
      { first, last, before, after }
    );
    return result;
  }

  @Query(() => AccountConnection)
  @UseGuards(GqlJwtAuthGuard)
  async allFollowersByFollowing(
    @AccountEntity() account: Account,
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'followingAccountId', type: () => Number, nullable: true })
    followingAccountId: number,
    @Args({
      name: 'orderBy',
      type: () => AccountOrder,
      nullable: true
    })
    orderBy: AccountOrder
  ) {
    const result = await findManyCursorConnection(
      paginationArgs =>
        this.prisma.followAccount
          .findMany({
            where: {
              followingAccountId: followingAccountId
            },
            include: {
              followerAccount: true
            },
            orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
            ...paginationArgs
          })
          .then(followers => followers.map(follower => follower.followerAccount)),
      () =>
        this.prisma.followAccount.count({
          where: {
            followingAccountId: followingAccountId
          }
        }),
      { first, last, before, after }
    );
    return result;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => FollowAccount)
  async createFollowAccount(@AccountEntity() account: Account, @Args('data') data: CreateFollowAccountInput) {
    try {
      const { followingAccountId, followerAccountId } = data;

      if (!account) {
        const couldNotFindAccount = await this.i18n.t('post.messages.couldNotFindAccount');
        throw new Error(couldNotFindAccount);
      }

      if (account.id !== followerAccountId) {
        const invalidAccountMessage = await this.i18n.t('account.messages.invalidAccount');
        throw new VError(invalidAccountMessage);
      }

      const existData = await this.prisma.followAccount.findFirst({
        where: {
          followingAccountId: followingAccountId,
          followerAccountId: followerAccountId
        }
      });

      if (existData) {
        return existData;
      }

      const createdFollowAccount = await this.prisma.followAccount.create({
        data: { ...data }
      });

      // Save to cache
      await this.followCacheService.createFollowAccount(
        followerAccountId,
        followingAccountId,
        createdFollowAccount.createdAt
      );

      // get recipient account
      const recipientAccount = await this.accountCacheService.getById(followingAccountId);
      if (!recipientAccount) {
        const accountNotExistMessage = await this.i18n.t('account.messages.accountNotExist');
        throw new VError(accountNotExistMessage);
      }

      const createNotif = {
        senderId: account.id,
        recipientId: _.toSafeInteger(recipientAccount.id),
        notificationTypeId: NOTIFICATION_TYPES.FOLLOW_ACCOUNT,
        level: NotificationLevel.INFO,
        url: '/profile/' + account.address,
        additionalData: {
          senderName: account.name,
          senderAddress: account.address,
          senderAvatar: account.avatar
        }
      };

      if (createNotif.senderId !== createNotif.recipientId) {
        await this.notificationService.saveAndDispatchNotification(createNotif);
      }

      pubSub.publish('followAccountCreated', { followAccountCreated: createdFollowAccount });
      return createdFollowAccount;
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Boolean)
  async deleteFollowAccount(@AccountEntity() account: Account, @Args('data') data: DeleteFollowAccountInput) {
    try {
      const { followingAccountId, followerAccountId } = data;

      if (!account) {
        const couldNotFindAccount = await this.i18n.t('post.messages.couldNotFindAccount');
        throw new Error(couldNotFindAccount);
      }

      if (account.id !== followerAccountId) {
        const invalidAccountMessage = await this.i18n.t('account.messages.invalidAccount');
        throw new VError(invalidAccountMessage);
      }

      const deletedFollowAccount = await this.prisma.followAccount.deleteMany({
        where: {
          followingAccountId: followingAccountId,
          followerAccountId: followerAccountId
        }
      });

      await this.followCacheService.removeFollowAccount(followerAccountId, followingAccountId);

      pubSub.publish('followAccountDeleted', { followAccountDeleted: deletedFollowAccount });
      return deletedFollowAccount ? true : false;
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Query(() => Boolean)
  @UseGuards(GqlJwtAuthGuard)
  async checkIfFollowPage(
    @PageAccountEntity() account: Account,
    @Args('pageId', { type: () => String, nullable: true }) pageId?: string
  ) {
    if (!account) {
      return false;
    }

    // We need to find out if the account follow the page or not
    return await this.followCacheService.checkIfAccountFollowPage(account.id, pageId!);
  }

  @Query(() => Boolean)
  @UseGuards(GqlJwtAuthGuard)
  async checkIfFollowToken(
    @PageAccountEntity() account: Account,
    @Args('tokenId', { type: () => String, nullable: true }) tokenId?: string
  ) {
    if (!account) {
      return false;
    }

    // We need to find out if the account follow the page or not
    return await this.followCacheService.checkIfAccountFollowToken(account.id, tokenId!);
  }

  @Query(() => FollowPageConnection)
  @UseGuards(GqlJwtAuthGuard)
  async allPagesByFollower(
    @AccountEntity() account: Account,
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'pagesOnly', type: () => Boolean, nullable: true }) pagesOnly: boolean
  ) {
    if (!account) {
      const accountNotExist = await this.i18n.t('account.messages.accountNotExist');
      throw Error(accountNotExist);
    }

    const queryFollowPagesInclude = pagesOnly == true ? { page: true } : ({ page: true, token: true } as const);
    const queryFollowPagesWhere =
      pagesOnly == true
        ? {
            AND: [{ accountId: account.id }, { token: null }]
          }
        : {
            accountId: account.id
          };

    const result = await findManyCursorConnection(
      async paginationArgs => {
        const pageFollowings = await this.prisma.followPage.findMany({
          where: queryFollowPagesWhere,
          include: queryFollowPagesInclude,
          orderBy: { createdAt: 'asc' },
          ...paginationArgs
        });

        const result = pageFollowings.map(row => ({
          ...row,
          page: row.page
            ? {
                ...row.page,
                totalBurnForPage: row.page.danaBurnScore + row.page.totalPostsBurnScore
              }
            : null
        }));

        return result;
      },
      () =>
        this.prisma.followPage.count({
          where: queryFollowPagesWhere
        }),
      { first, last, before, after }
    );

    return result;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => FollowPage)
  async createFollowPage(@AccountEntity() account: Account, @Args('data') data: CreateFollowPageInput) {
    try {
      const { accountId, pageId } = data;

      if (!account) {
        const couldNotFindAccount = await this.i18n.t('post.messages.couldNotFindAccount');
        throw new Error(couldNotFindAccount);
      }

      if (account.id !== accountId) {
        const invalidAccountMessage = await this.i18n.t('account.messages.invalidAccount');
        throw new VError(invalidAccountMessage);
      }

      const existData = await this.prisma.followPage.findFirst({
        where: {
          AND: [{ accountId: accountId }, { pageId: pageId }]
        }
      });

      if (existData) {
        return existData;
      }

      const createdFollowPage = await this.prisma.followPage.create({
        data: {
          accountId: account.id,
          pageId: pageId
        }
      });

      // Save to cache
      pageId && (await this.followCacheService.createFollowPage(accountId, pageId, createdFollowPage.createdAt));

      if (pageId) {
        const recipient = await this.prisma.account.findFirst({
          where: {
            pages: {
              some: {
                id: pageId
              }
            }
          },
          include: {
            pages: true
          }
        });

        if (!recipient) {
          const accountNotExistMessage = await this.i18n.t('account.messages.accountNotExist');
          throw new VError(accountNotExistMessage);
        }

        const createNotif = {
          senderId: account.id,
          recipientId: recipient.id,
          notificationTypeId: NOTIFICATION_TYPES.FOLLOW_PAGE,
          level: NotificationLevel.INFO,
          url: '/profile/' + account.address,
          additionalData: {
            senderName: account.name,
            senderAddress: account.address,
            senderAvatar: account.avatar,
            pageName: recipient.pages.find(page => page.id == pageId)?.name ?? undefined
          }
        };

        createNotif.senderId !== createNotif.recipientId &&
          (await this.notificationService.saveAndDispatchNotification(createNotif));
      }

      pubSub.publish('followPageCreated', { followPageCreated: createdFollowPage });
      return createdFollowPage;
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => FollowPage)
  async createFollowToken(@AccountEntity() account: Account, @Args('data') data: CreateFollowTokenInput) {
    try {
      const { accountId, tokenId } = data;

      if (!account) {
        const couldNotFindAccount = await this.i18n.t('post.messages.couldNotFindAccount');
        throw new Error(couldNotFindAccount);
      }

      if (account.id !== accountId) {
        const invalidAccountMessage = await this.i18n.t('account.messages.invalidAccount');
        throw new VError(invalidAccountMessage);
      }

      const existData = await this.prisma.followPage.findFirst({
        where: {
          AND: [{ accountId: accountId }, { tokenId: tokenId }]
        }
      });

      if (existData) {
        return existData;
      }

      const followTokenCreated = await this.prisma.followPage.create({
        data: {
          accountId: account.id,
          tokenId: tokenId
        }
      });

      // Save to cache
      tokenId && (await this.followCacheService.createFollowToken(accountId, tokenId, followTokenCreated.createdAt));

      pubSub.publish('followTokenCreated', { followTokenCreated: followTokenCreated });
      return followTokenCreated;
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Boolean)
  async deleteFollowPage(@AccountEntity() account: Account, @Args('data') data: DeleteFollowPageInput) {
    try {
      const { accountId, pageId } = data;

      if (!account) {
        const couldNotFindAccount = await this.i18n.t('post.messages.couldNotFindAccount');
        throw new Error(couldNotFindAccount);
      }

      if (account.id !== accountId) {
        const invalidAccountMessage = await this.i18n.t('account.messages.invalidAccount');
        throw new VError(invalidAccountMessage);
      }

      const deletedFollowPage = await this.prisma.followPage.deleteMany({
        where: {
          ...data
        }
      });

      pageId && (await this.followCacheService.removeFollowPage(accountId, pageId));

      pubSub.publish('followPageDeleted', { followPageDeleted: deletedFollowPage });
      return deletedFollowPage ? true : false;
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Boolean)
  async deleteFollowToken(@AccountEntity() account: Account, @Args('data') data: DeleteFollowTokenInput) {
    try {
      const { accountId, tokenId } = data;

      if (!account) {
        const couldNotFindAccount = await this.i18n.t('post.messages.couldNotFindAccount');
        throw new Error(couldNotFindAccount);
      }

      if (account.id !== accountId) {
        const invalidAccountMessage = await this.i18n.t('account.messages.invalidAccount');
        throw new VError(invalidAccountMessage);
      }

      const deletedFollowPage = await this.prisma.followPage.deleteMany({
        where: {
          ...data
        }
      });

      tokenId && (await this.followCacheService.removeFollowToken(accountId, tokenId));

      pubSub.publish('followPageDeleted', { followPageDeleted: deletedFollowPage });
      return deletedFollowPage ? true : false;
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @ResolveField('avatar', () => String)
  async avatar(@Parent() account: Account) {
    const uploadDetail = await this.prisma.account
      .findUnique({
        where: {
          id: account.id
        }
      })
      .avatar({
        include: {
          upload: true
        }
      });

    if (_.isNil(uploadDetail)) return null;

    const { upload } = uploadDetail;
    const cfUrl = `${process.env.CF_IMAGES_DELIVERY_URL}/${process.env.CF_ACCOUNT_HASH}/${upload.cfImageId}/public`;
    const url = upload.cfImageId ? cfUrl : upload.url;

    return url;
  }
}
