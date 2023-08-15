import {
  Account,
  CreateMessageInput,
  Message,
  MessageConnection,
  MessageOrder,
  PaginationArgs
} from '@bcpros/lixi-models';
import { PageMessageSessionStatus } from '@bcpros/lixi-prisma';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { SkipThrottle } from '@nestjs/throttler';
import { PubSub } from 'graphql-subscriptions';
import * as _ from 'lodash';
import moment from 'moment';
import { I18n, I18nService } from 'nestjs-i18n';
import { connectionFromArraySlice } from 'src/common/custom-graphql-relay/arrayConnection';
import { NotificationGateway } from 'src/common/modules/notifications/notification.gateway';
import { AccountEntity } from 'src/decorators/account.decorator';
import { GqlHttpExceptionFilter } from 'src/middlewares/gql.exception.filter';
import ConnectionArgs, { getPagingParameters } from '../../common/custom-graphql-relay/connection.args';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwtauth.guard';
import { PERSON } from '../page/constants/meili.constants';
import { MeiliService } from '../page/meili.service';
import { PrismaService } from '../prisma/prisma.service';

const pubSub = new PubSub();

@SkipThrottle()
@Resolver(() => Message)
@UseFilters(GqlHttpExceptionFilter)
export class MessageResolver {
  constructor(
    private logger: Logger,
    private prisma: PrismaService,
    private meiliService: MeiliService,
    @I18n() private i18n: I18nService,
    private notificationGateway: NotificationGateway
  ) {}

  @Subscription(() => Message)
  messageCreated() {
    return pubSub.asyncIterator('messageCreated');
  }

  @Query(() => Message)
  async message(@Args('id', { type: () => String }) id: string) {
    const result = await this.prisma.message.findUnique({
      where: { id: id }
    });

    return result;
  }

  @Query(() => MessageConnection)
  async allMessageByPageMessageSessionId(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'id', type: () => String, nullable: true }) id: string,
    @Args({
      name: 'orderBy',
      type: () => MessageOrder,
      nullable: true
    })
    orderBy: MessageOrder
  ) {
    const result = await findManyCursorConnection(
      args =>
        this.prisma.message.findMany({
          include: { author: true, pageMessageSession: true },
          where: {
            pageMessageSessionId: id
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args
        }),
      () =>
        this.prisma.message.count({
          where: {
            pageMessageSessionId: id
          }
        }),
      { first, last, before, after }
    );
    return result;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Message)
  async createMessage(@AccountEntity() account: Account, @Args('data') data: CreateMessageInput) {
    if (!account) {
      const couldNotFindAccount = this.i18n.t('post.messages.couldNotFindAccount');
      throw new Error(couldNotFindAccount);
    }

    const { authorId, body, isPageOwner, pageMessageSessionId } = data;

    if (account.id !== authorId) {
      return null;
    }

    //check pageMessageSession is open
    const pageMessageSession = await this.prisma.pageMessageSession.findUnique({
      where: {
        id: pageMessageSessionId
      }
    });

    if (pageMessageSession && pageMessageSession.status === PageMessageSessionStatus.OPEN) {
      const updatedAt = new Date();

      const message = await this.prisma.$transaction(async prisma => {
        const result = await prisma.message.create({
          data: {
            body: body,
            isPageOwner: isPageOwner ?? false,
            author: { connect: { id: authorId } },
            pageMessageSession: { connect: { id: pageMessageSessionId } }
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                address: true
              }
            },
            pageMessageSession: {
              select: {
                pageId: true
              }
            }
          }
        });

        await prisma.pageMessageSession.update({
          where: {
            id: pageMessageSession.id
          },
          data: {
            updatedAt: updatedAt,
            latestMessage: body
          }
        });

        return result;
      });

      const result = {
        ...message,
        pageMessageSessionId: pageMessageSessionId,
        updatedAt: updatedAt
      };

      this.notificationGateway.publishMessage(pageMessageSessionId!, result);

      return result;
    }
  }

  @ResolveField()
  async pageMessageSession(@Parent() message: Message) {
    const pageMessageSession = await this.prisma.pageMessageSession.findFirst({
      where: {
        messages: {
          some: {
            id: message.id
          }
        }
      }
    });
    return pageMessageSession;
  }
}
