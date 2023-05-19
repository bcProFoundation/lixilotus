import {
  Account,
  CreateFollowAccountInput,
  CreateFollowPageInput,
  DeleteFollowAccountInput,
  DeleteFollowPageInput,
  FollowAccount,
  FollowAccountConnection,
  FollowAccountOrder,
  FollowPage,
  PaginationArgs
} from '@bcpros/lixi-models';
import { PrismaService } from '../prisma/prisma.service';
import { HttpException, HttpStatus, Injectable, Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { I18n, I18nService } from 'nestjs-i18n';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwtauth.guard';
import { AccountEntity } from 'src/decorators/account.decorator';
import VError from 'verror';
import { GqlHttpExceptionFilter } from 'src/middlewares/gql.exception.filter';
import _ from 'lodash';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { PageAccountEntity } from 'src/decorators/pageAccount.decorator';
import { NOTIFICATION_TYPES } from 'src/common/modules/notifications/notification.constants';
import { NotificationService } from 'src/common/modules/notifications/notification.service';
import { NotificationLevel } from '@bcpros/lixi-prisma';

const pubSub = new PubSub();

@Resolver(() => FollowAccount)
@UseFilters(GqlHttpExceptionFilter)
export class FollowResolver {
  private logger: Logger = new Logger(FollowResolver.name);

  constructor(
    private prisma: PrismaService,
    private readonly notificationService: NotificationService,
    @I18n() private i18n: I18nService
  ) { }

  @Subscription(() => FollowAccount)
  followAccountCreated() {
    return pubSub.asyncIterator('followAccountCreated');
  }

  // Follow Account
  @Query(() => FollowAccount)
  @UseGuards(GqlJwtAuthGuard)
  async checkIsFollowedAccount(
    @PageAccountEntity() account: Account,
    @Args('address', { type: () => String }) address: string
  ) {
    const accountQuery = await this.prisma.account.findFirst({
      where: { address: address }
    });

    if (!account || !accountQuery) {
      const couldNotFindAccount = await this.i18n.t('page.messages.couldNotFindAccount');
      throw new VError.WError(couldNotFindAccount);
    }

    const existData = await this.prisma.followAccount.findFirst({
      where: {
        followingAccountId: accountQuery.id,
        followerAccountId: account.id
      }
    });

    const result = {
      ...existData,
      isFollowed: existData ? true : false
    };

    return result;
  }

  @Query(() => FollowAccountConnection)
  async allFollowingsByFollower(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'followerAccountId', type: () => Number, nullable: true })
    followerAccountId: number,
    @Args({
      name: 'orderBy',
      type: () => FollowAccountOrder,
      nullable: true
    })
    orderBy: FollowAccountOrder
  ) {
    const result = await findManyCursorConnection(
      paginationArgs =>
        this.prisma.followAccount.findMany({
          where: {
            followerAccountId: followerAccountId
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...paginationArgs
        }),
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

  @Query(() => FollowAccountConnection)
  async allFollowersByFollowing(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'followingAccountId', type: () => Number, nullable: true })
    followingAccountId: number,
    @Args({
      name: 'orderBy',
      type: () => FollowAccountOrder,
      nullable: true
    })
    orderBy: FollowAccountOrder
  ) {
    const result = await findManyCursorConnection(
      paginationArgs =>
        this.prisma.followAccount.findMany({
          where: {
            followingAccountId: followingAccountId
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...paginationArgs
        }),
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

      const recipient = await this.prisma.account.findFirst({
        where: {
          id: _.toSafeInteger(followingAccountId)
        }
      });

      if (!recipient) {
        const accountNotExistMessage = await this.i18n.t('account.messages.accountNotExist');
        throw new VError(accountNotExistMessage);
      }

      const createNotif = {
        senderId: account.id,
        recipientId: recipient.id,
        notificationTypeId: NOTIFICATION_TYPES.FOLLOW_ACCOUNT,
        level: NotificationLevel.INFO,
        url: '/profile/' + account.address,
        additionalData: {
          senderName: account.name
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

      pubSub.publish('followAccountDeleted', { followAccountDeleted: deletedFollowAccount });
      return deletedFollowAccount ? true : false;
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Follow Page
  @Query(() => FollowPage)
  @UseGuards(GqlJwtAuthGuard)
  async checkIsFollowedPage(
    @PageAccountEntity() account: Account,
    @Args('pageId', { type: () => String }) pageId: string
  ) {
    if (!account) {
      const couldNotFindAccount = await this.i18n.t('page.messages.couldNotFindAccount');
      throw new VError.WError(couldNotFindAccount);
    }

    const existData = await this.prisma.followPage.findFirst({
      where: {
        pageId: pageId,
        accountId: account.id
      }
    });

    const result = {
      ...existData,
      isFollowed: existData ? true : false
    };

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
          accountId: accountId,
          pageId: pageId
        }
      });

      if (existData) {
        return existData;
      }

      const createdFollowPage = await this.prisma.followPage.create({
        data: { ...data }
      });

      const recipient = await this.prisma.account.findFirst({
        where: {
          page: {
            id: pageId
          }
        },
        include: {
          page: true
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
          pageName: recipient.page?.name
        }
      };

      createNotif.senderId !== createNotif.recipientId &&
        (await this.notificationService.saveAndDispatchNotification(createNotif));

      pubSub.publish('followPageCreated', { followPageCreated: createdFollowPage });
      return createdFollowPage;
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
          accountId: accountId,
          pageId: pageId
        }
      });

      pubSub.publish('followPageDeleted', { followPageDeleted: deletedFollowPage });
      return deletedFollowPage ? true : false;
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
