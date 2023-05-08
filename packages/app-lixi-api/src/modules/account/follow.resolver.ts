import {
  Account,
  CreateFollowAccountInput,
  CreateFollowPageInput,
  FollowAccount,
  FollowPage
} from '@bcpros/lixi-models';
import { PrismaService } from '../prisma/prisma.service';
import { HttpException, HttpStatus, Injectable, Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { I18n, I18nService } from 'nestjs-i18n';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwtauth.guard';
import { AccountEntity } from 'src/decorators/account.decorator';
import VError from 'verror';
import { GqlHttpExceptionFilter } from 'src/middlewares/gql.exception.filter';

const pubSub = new PubSub();

@Resolver(() => FollowAccount)
@UseFilters(GqlHttpExceptionFilter)
export class FollowResolver {
  constructor(private logger: Logger, private prisma: PrismaService, @I18n() private i18n: I18nService) {}

  @Subscription(() => FollowAccount)
  followAccountCreated() {
    return pubSub.asyncIterator('followAccountCreated');
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

      const existData = await this.prisma.followAccount.findFirst({
        where: {
          followerAccountId: followerAccountId,
          followingAccountId: followingAccountId
        }
      });

      if (existData) {
        throw new Error('You are already follow this account');
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
  @Mutation(() => FollowPage)
  async createFollowPage(@AccountEntity() account: Account, @Args('data') data: CreateFollowPageInput) {
    try {
      const { accountId, pageId } = data;

      if (!account) {
        const couldNotFindAccount = await this.i18n.t('post.messages.couldNotFindAccount');
        throw new Error(couldNotFindAccount);
      }

      const existData = await this.prisma.followPage.findFirst({
        where: {
          accountId: accountId,
          pageId: pageId
        }
      });

      if (existData) {
        throw new Error('You are already follow this page');
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
}
