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

const pubSub = new PubSub();

@Resolver(() => FollowAccount)
@UseFilters(GqlHttpExceptionFilter)
export class FollowResolver {
  constructor(private logger: Logger, private prisma: PrismaService, @I18n() private i18n: I18nService) {}

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
        followerAccountId: accountQuery.id,
        followingAccountId: account.id
      }
    });

    const result = {
      ...existData,
      isFollowed: existData ? true : false
    };

    return result;
  }

  @Query(() => FollowAccountConnection)
  async allFollowers(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'query', type: () => Number, nullable: true })
    query: number,
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
            OR: !query
              ? undefined
              : {
                  followingAccountId: { equals: query }
                }
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...paginationArgs
        }),
      () =>
        this.prisma.followAccount.count({
          where: {
            OR: !query
              ? undefined
              : {
                  followingAccountId: { equals: query }
                }
          }
        }),
      { first, last, before, after }
    );
    return result;
  }

  @Query(() => FollowAccountConnection)
  async allFollowings(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'query', type: () => Number, nullable: true })
    query: number,
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
            OR: !query
              ? undefined
              : {
                  followerAccountId: { equals: query }
                }
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...paginationArgs
        }),
      () =>
        this.prisma.followAccount.count({
          where: {
            OR: !query
              ? undefined
              : {
                  followerAccountId: { equals: query }
                }
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
      const { followerAccountId, followingAccountId } = data;

      if (!account) {
        const couldNotFindAccount = await this.i18n.t('post.messages.couldNotFindAccount');
        throw new Error(couldNotFindAccount);
      }

      if (account.id !== followingAccountId) {
        const invalidAccountMessage = await this.i18n.t('account.messages.invalidAccount');
        throw new VError(invalidAccountMessage);
      }

      const existData = await this.prisma.followAccount.findFirst({
        where: {
          followerAccountId: followerAccountId,
          followingAccountId: followingAccountId
        }
      });

      if (existData) {
        return existData;
      }

      const createdFollowAccount = await this.prisma.followAccount.create({
        data: { ...data }
      });

      pubSub.publish('followAccountCreated', { followAccountCreated: createdFollowAccount });
      return createdFollowAccount;
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => FollowAccount)
  async deleteFollowAccount(@AccountEntity() account: Account, @Args('data') data: DeleteFollowAccountInput) {
    try {
      const { followerAccountId, followingAccountId } = data;

      if (!account) {
        const couldNotFindAccount = await this.i18n.t('post.messages.couldNotFindAccount');
        throw new Error(couldNotFindAccount);
      }

      if (account.id !== followingAccountId) {
        const invalidAccountMessage = await this.i18n.t('account.messages.invalidAccount');
        throw new VError(invalidAccountMessage);
      }

      const existData = await this.prisma.followAccount.findFirst({
        where: {
          followerAccountId: followerAccountId,
          followingAccountId: followingAccountId
        }
      });

      if (!existData) {
        return existData;
      }

      const deletedFollowAccount = await this.prisma.followAccount.delete({
        where: { id: existData.id }
      });

      pubSub.publish('followAccountDeleted', { followAccountDeleted: deletedFollowAccount });
      return deletedFollowAccount;
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

      const existData = await this.prisma.followPage.findFirst({
        where: {
          accountId: accountId,
          pageId: pageId
        }
      });

      if (!existData) {
        return existData;
      }

      const deletedFollowPage = await this.prisma.followPage.delete({
        where: { id: existData.id }
      });

      pubSub.publish('followPageDeleted', { followPageDeleted: deletedFollowPage });
      return deletedFollowPage;
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
