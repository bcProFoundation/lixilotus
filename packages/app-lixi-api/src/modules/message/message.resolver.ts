import {
  Account,
  CreateMessageInput,
  Message,
  MessageConnection,
  MessageOrder,
  PaginationArgs
} from '@bcpros/lixi-models';
import { MessageType, PageMessageSessionStatus } from '@bcpros/lixi-prisma';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { Inject, Logger, UseFilters, UseGuards } from '@nestjs/common';
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
import BCHJS from '@bcpros/xpi-js';
import { ChronikClient } from 'chronik-client';
import { InjectChronikClient } from 'src/common/modules/chronik/chronik.decorators';

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
    private notificationGateway: NotificationGateway,
    @Inject('xpijs') private XPI: BCHJS,
    @InjectChronikClient('xpi') private chronik: ChronikClient
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

    const { authorId, body, isPageOwner, pageMessageSessionId, tipHex, uploadIds } = data;

    if (account.id !== authorId) {
      return null;
    }

    //check pageMessageSession is open
    const pageMessageSession = await this.prisma.pageMessageSession.findUnique({
      where: {
        id: pageMessageSessionId
      },
      select: {
        status: true,
        id: true,
        account: {
          select: {
            id: true,
            address: true
          }
        },
        page: {
          select: {
            pageAccount: {
              select: {
                id: true,
                address: true
              }
            }
          }
        }
      }
    });

    if (pageMessageSession && pageMessageSession.status === PageMessageSessionStatus.OPEN) {
      const updatedAt = new Date();
      let uploadDetailIds: any[] = [];

      //check if there is upload
      if (uploadIds && uploadIds.length > 0) {
        const promises = uploadIds.map(async (id: string) => {
          const uploadDetails = await this.prisma.uploadDetail.findFirst({
            where: {
              uploadId: id
            }
          });

          return uploadDetails && uploadDetails.id;
        });

        uploadDetailIds = await Promise.all(promises);
      }

      const message = await this.prisma.$transaction(async prisma => {
        const result = await prisma.message.create({
          data: {
            body: body,
            isPageOwner: isPageOwner ?? false,
            author: { connect: { id: authorId } },
            pageMessageSession: { connect: { id: pageMessageSessionId } },
            uploads: {
              connect:
                uploadDetailIds.length > 0
                  ? uploadDetailIds.map((uploadDetail: any) => {
                      return {
                        id: uploadDetail
                      };
                    })
                  : undefined
            },
            messageType: uploadDetailIds.length > 0 ? MessageType.IMAGE : MessageType.TEXT
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
            },
            uploads: {
              select: {
                id: true,
                upload: true
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

        //Give Tip
        if (tipHex) {
          const txData = await this.XPI.RawTransactions.decodeRawTransaction(tipHex);
          const tipValue = txData['vout'][0].value;
          if (Number(tipValue) < 0) {
            throw new Error('Syntax error. Number cannot be less than or equal to 0');
          }

          const broadcastResponse = await this.chronik.broadcastTx(tipHex);
          if (!broadcastResponse) {
            throw new Error('Empty chronik broadcast response');
          }

          const { txid } = broadcastResponse;
          const determineAddress = isPageOwner
            ? {
                fromAddress: pageMessageSession.page.pageAccount.address,
                fromAccountId: pageMessageSession.page.pageAccount.id,
                toAddress: pageMessageSession.account.address,
                toAccountId: pageMessageSession.account.id
              }
            : {
                fromAddress: pageMessageSession.account.address,
                fromAccountId: pageMessageSession.account.id,
                toAddress: pageMessageSession.page.pageAccount.address,
                toAccountId: pageMessageSession.page.pageAccount.id
              };

          const transactionTip = {
            txid,
            ...determineAddress,
            tipValue: tipValue
          };
          await prisma.giveTipMessage.create({
            data: {
              ...transactionTip,
              message: {
                connect: {
                  id: result.id
                }
              }
            }
          });
        }

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

  @ResolveField()
  async uploads(@Parent() message: Message) {
    const uploads = await this.prisma.uploadDetail.findMany({
      where: {
        messageId: message.id
      },
      include: {
        upload: {
          select: {
            id: true,
            sha: true,
            bucket: true,
            width: true,
            height: true,
            sha800: true,
            sha320: true,
            sha40: true,
            cfImageId: true,
            cfImageFilename: true
          }
        }
      }
    });
    return uploads;
  }
}
