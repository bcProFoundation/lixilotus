import {
  ClosePageMessageSessionInput,
  NotificationDto,
  NOTIFICATION_TYPES,
  OpenPageMessageSessionInput,
  PageMessageSessionConnection,
  PageMessageSessionOrder,
  SessionAction,
  SessionActionEnum
} from '@bcpros/lixi-models';
import { Account, CreatePageMessageInput, PageMessageSession, PaginationArgs } from '@bcpros/lixi-models';
import { Notification, NotificationLevel, PageMessageSessionStatus } from '@bcpros/lixi-prisma';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { SkipThrottle } from '@nestjs/throttler';
import { PubSub } from 'graphql-subscriptions';
import * as _ from 'lodash';
import { I18n, I18nService } from 'nestjs-i18n';
import { NotificationGateway } from 'src/common/modules/notifications/notification.gateway';
import { AccountEntity } from 'src/decorators/account.decorator';
import { GqlHttpExceptionFilter } from 'src/middlewares/gql.exception.filter';
import { aesGcmDecrypt, numberToBase58 } from 'src/utils/encryptionMethods';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwtauth.guard';
import { MeiliService } from '../page/meili.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from 'src/common/modules/notifications/notification.service';
import { PageMessageSessionCacheService } from './page-message-session-cache.service';

const pubSub = new PubSub();

@SkipThrottle()
@Resolver(() => PageMessageSession)
@UseFilters(GqlHttpExceptionFilter)
export class PageMessageSessionResolver {
  constructor(
    private logger: Logger,
    private prisma: PrismaService,
    private meiliService: MeiliService,
    @I18n() private i18n: I18nService,
    private notificationGateway: NotificationGateway,
    private readonly notificationService: NotificationService,
    private readonly pageMessageSessionCacheService: PageMessageSessionCacheService
  ) {}

  @Subscription(() => PageMessageSession)
  pageMessageSessionCreated() {
    return pubSub.asyncIterator('pageMessageSessionCreated');
  }

  @Query(() => PageMessageSession)
  async pageMessageSession(@Args('id', { type: () => String }) id: string) {
    const result = await this.prisma.pageMessageSession.findUnique({
      where: { id: id }
    });

    return result;
  }

  @Query(() => PageMessageSessionConnection)
  async allOpenPageMessageSessionByPageId(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'id', type: () => String, nullable: true }) id: string,
    @Args({
      name: 'orderBy',
      type: () => PageMessageSessionOrder,
      nullable: true
    })
    orderBy: PageMessageSessionOrder
  ) {
    const result = await findManyCursorConnection(
      args =>
        this.prisma.pageMessageSession.findMany({
          include: {
            account: true,
            page: true,
            lixi: {
              select: {
                id: true,
                name: true,
                amount: true,
                expiryAt: true,
                activationAt: true,
                status: true
              }
            }
          },
          where: {
            AND: [
              {
                pageId: id
              },
              {
                status: PageMessageSessionStatus.OPEN
              }
            ]
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args
        }),
      () =>
        this.prisma.pageMessageSession.count({
          where: {
            AND: [
              {
                pageId: id
              },
              {
                status: PageMessageSessionStatus.OPEN
              }
            ]
          }
        }),
      { first, last, before, after }
    );
    return result;
  }

  @Query(() => PageMessageSessionConnection)
  async allPendingPageMessageSessionByPageId(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'id', type: () => String, nullable: true }) id: string,
    @Args({
      name: 'orderBy',
      type: () => PageMessageSessionOrder,
      nullable: true
    })
    orderBy: PageMessageSessionOrder
  ) {
    const result = await findManyCursorConnection(
      args =>
        this.prisma.pageMessageSession.findMany({
          include: {
            account: true,
            page: true,
            lixi: {
              select: {
                id: true,
                name: true,
                amount: true,
                expiryAt: true,
                activationAt: true,
                status: true
              }
            }
          },
          where: {
            AND: [
              {
                pageId: id
              },
              {
                status: PageMessageSessionStatus.PENDING
              }
            ]
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args
        }),
      () =>
        this.prisma.pageMessageSession.count({
          where: {
            AND: [
              {
                pageId: id
              },
              {
                status: PageMessageSessionStatus.PENDING
              }
            ]
          }
        }),
      { first, last, before, after }
    );
    return result;
  }

  @Query(() => PageMessageSessionConnection)
  async allOpenPageMessageSessionByAccountId(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'id', type: () => Number, nullable: true }) id: number,
    @Args({
      name: 'orderBy',
      type: () => PageMessageSessionOrder,
      nullable: true
    })
    orderBy: PageMessageSessionOrder
  ) {
    const result = await findManyCursorConnection(
      args =>
        this.prisma.pageMessageSession.findMany({
          include: {
            account: true,
            page: true,
            lixi: {
              select: {
                id: true,
                name: true,
                amount: true,
                expiryAt: true,
                activationAt: true,
                status: true
              }
            }
          },
          where: {
            AND: [
              {
                accountId: id
              },
              {
                status: PageMessageSessionStatus.OPEN
              }
            ]
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args
        }),
      () =>
        this.prisma.pageMessageSession.count({
          where: {
            AND: [
              {
                accountId: id
              },
              {
                status: PageMessageSessionStatus.OPEN
              }
            ]
          }
        }),
      { first, last, before, after }
    );
    return result;
  }

  @Query(() => PageMessageSessionConnection)
  async allPendingPageMessageSessionByAccountId(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'id', type: () => Number, nullable: true }) id: number,
    @Args({
      name: 'orderBy',
      type: () => PageMessageSessionOrder,
      nullable: true
    })
    orderBy: PageMessageSessionOrder
  ) {
    const result = await findManyCursorConnection(
      args =>
        this.prisma.pageMessageSession.findMany({
          include: {
            account: true,
            page: true,
            lixi: {
              select: {
                id: true,
                name: true,
                amount: true,
                expiryAt: true,
                activationAt: true,
                status: true
              }
            }
          },
          where: {
            AND: [
              {
                accountId: id
              },
              {
                status: PageMessageSessionStatus.PENDING
              }
            ]
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args
        }),
      () =>
        this.prisma.pageMessageSession.count({
          where: {
            AND: [
              {
                accountId: id
              },
              {
                status: PageMessageSessionStatus.PENDING
              }
            ]
          }
        }),
      { first, last, before, after }
    );
    return result;
  }

  @Query(() => PageMessageSessionConnection)
  async allPageMessageSessionByAccountId(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'id', type: () => Number, nullable: true }) id: number,
    @Args({
      name: 'orderBy',
      type: () => PageMessageSessionOrder,
      nullable: true
    })
    orderBy: PageMessageSessionOrder
  ) {
    const result = await findManyCursorConnection(
      async args => {
        let sessions = [];
        const pageMessageSessions = await this.prisma.pageMessageSession.findMany({
          include: {
            page: true,
            account: true,
            lixi: {
              select: {
                id: true,
                name: true,
                amount: true,
                expiryAt: true,
                activationAt: true,
                status: true
              }
            }
          },
          where: {
            AND: [
              {
                OR: [
                  {
                    page: {
                      pageAccountId: id
                    }
                  },
                  {
                    accountId: id
                  }
                ]
              },
              {
                NOT: [
                  {
                    status: PageMessageSessionStatus.CLOSE
                  }
                ]
              }
            ]
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args
        });

        const latestMessageCache = await this.pageMessageSessionCacheService.getMultiplePageMessageSessionCache(
          pageMessageSessions.map(pageMessageSession => pageMessageSession.id)
        );

        //combine cache and db
        for (let i = 0; i < pageMessageSessions.length; i++) {
          const latestMessage = {
            id: latestMessageCache[i]?.latestMessageId,
            body: latestMessageCache[i]?.latestMessage,
            author: {
              id: latestMessageCache[i]?.authorId === '' ? 0 : latestMessageCache[i]?.authorId,
              address: latestMessageCache[i]?.authorAddress
            }
          };
          sessions.push({ ...pageMessageSessions[i], latestMessage: latestMessage });
        }

        return sessions;
      },
      () =>
        this.prisma.pageMessageSession.count({
          where: {
            AND: [
              {
                OR: [
                  {
                    page: {
                      pageAccountId: id
                    }
                  },
                  {
                    accountId: id
                  }
                ]
              },
              {
                NOT: [
                  {
                    status: PageMessageSessionStatus.CLOSE
                  }
                ]
              }
            ]
          }
        }),
      { first, last, before, after }
    );
    return result;
  }

  @Query(() => PageMessageSessionConnection)
  async allClosedPageMessageSession(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'accountId', type: () => Number, nullable: true }) accountId: number,
    @Args({ name: 'pageId', type: () => String, nullable: true }) pageId: string,
    @Args({
      name: 'orderBy',
      type: () => PageMessageSessionOrder,
      nullable: true
    })
    orderBy: PageMessageSessionOrder
  ) {
    const result = await findManyCursorConnection(
      args =>
        this.prisma.pageMessageSession.findMany({
          include: {
            page: true,
            account: true,
            lixi: {
              select: {
                id: true,
                name: true,
                amount: true,
                expiryAt: true,
                activationAt: true,
                status: true
              }
            }
          },
          where: {
            AND: [
              {
                pageId: pageId
              },
              {
                accountId: accountId
              },
              {
                status: PageMessageSessionStatus.CLOSE
              }
            ]
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args
        }),
      () =>
        this.prisma.pageMessageSession.count({
          where: {
            AND: [
              {
                pageId: pageId
              },
              {
                accountId: accountId
              },
              {
                status: PageMessageSessionStatus.CLOSE
              }
            ]
          }
        }),
      { first, last, before, after }
    );
    return result;
  }

  //This is for user only
  @Query(() => PageMessageSession, { nullable: true })
  async userHadMessageToPage(
    @Args({ name: 'accountId', type: () => Number, nullable: true }) accountId: number,
    @Args({ name: 'pageId', type: () => String, nullable: true }) pageId: string
  ) {
    const result = await this.prisma.pageMessageSession.findFirst({
      include: {
        account: true,
        page: true
      },
      where: {
        AND: [
          {
            accountId: accountId
          },
          {
            pageId: pageId
          },
          {
            OR: [
              {
                status: PageMessageSessionStatus.PENDING
              },
              {
                status: PageMessageSessionStatus.OPEN
              }
            ]
          }
        ]
      }
    });
    return result;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => PageMessageSession)
  async createPageMessageSession(@AccountEntity() account: Account, @Args('data') data: CreatePageMessageInput) {
    if (!account) {
      const couldNotFindAccount = this.i18n.t('post.messages.couldNotFindAccount');
      throw new Error(couldNotFindAccount);
    }

    const { accountId, pageId, lixiId, accountSecret } = data;

    if (account.id !== accountId) {
      throw new Error('Unauthorized to create page message session');
    }

    //check if there already pending message or already open
    const pendingOrOpenPageMessageSession = await this.prisma.pageMessageSession.findMany({
      where: {
        pageId: pageId,
        accountId: accountId,
        OR: [
          {
            status: PageMessageSessionStatus.PENDING
          },
          {
            status: PageMessageSessionStatus.OPEN
          }
        ]
      }
    });

    const lixi = await this.prisma.lixi.findUnique({
      where: {
        id: lixiId
      }
    });

    const page = await this.prisma.page.findUnique({
      where: {
        id: pageId
      }
    });

    //if there is no pending or open message session && has lixi && not the owner , create new one
    if (pendingOrOpenPageMessageSession.length === 0 && lixi !== null && page?.pageAccountId !== accountId) {
      let claimCode = '';
      if (accountSecret && !_.isNil(accountSecret)) {
        const claimPart = await aesGcmDecrypt(lixi.encryptedClaimCode, accountSecret);
        const encodedId = numberToBase58(lixi.id);
        claimCode = claimPart + encodedId;
      }
      const result = await this.prisma.pageMessageSession.create({
        include: {
          page: {
            include: {
              pageAccount: true
            }
          },
          account: true,
          lixi: {
            select: {
              id: true,
              name: true,
              amount: true,
              expiryAt: true,
              activationAt: true,
              status: true
            }
          }
        },
        data: {
          account: { connect: { id: accountId } },
          page: { connect: { id: pageId } },
          lixi: lixiId ? { connect: { id: lixiId } } : undefined,
          lixiClaimCode: claimCode,
          status: PageMessageSessionStatus.PENDING
        }
      });

      const notification: NotificationDto = {
        senderId: account.id,
        recipientId: page?.pageAccountId,
        notificationTypeId: NOTIFICATION_TYPES.PAGE_MESSAGE_REQUEST,
        level: NotificationLevel.INFO,
        url: `/page-message`,
        additionalData: {
          senderName: account.name,
          lixiAmount: lixi?.amount.toFixed(0),
          pageName: page?.name
        }
      };

      await this.notificationService.saveAndDispatchNotification(notification);

      //publish to page account and user account
      this.notificationGateway.publishAddressChannel(result.page.pageAccount.address, result);
      this.notificationGateway.publishAddressChannel(result.account.address, result);

      return result;
    }
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => PageMessageSession)
  async closePageMessageSession(@AccountEntity() account: Account, @Args('data') data: ClosePageMessageSessionInput) {
    if (!account) {
      const couldNotFindAccount = this.i18n.t('post.messages.couldNotFindAccount');
      throw new Error(couldNotFindAccount);
    }

    const { pageMessageSessionId } = data;

    const pageMessageSession = await this.prisma.pageMessageSession.findUnique({
      where: {
        id: pageMessageSessionId
      },
      include: {
        page: {
          select: {
            name: true,
            pageAccountId: true
          }
        }
      }
    });

    if (pageMessageSession?.page.pageAccountId !== account.id) {
      return null;
    }

    const result = await this.prisma.pageMessageSession.update({
      where: {
        id: pageMessageSessionId
      },
      data: {
        status: PageMessageSessionStatus.CLOSE,
        sessionClosedAt: new Date()
      },
      include: {
        page: {
          include: {
            pageAccount: true
          }
        },
        account: true,
        lixi: {
          select: {
            id: true,
            name: true,
            amount: true,
            expiryAt: true,
            activationAt: true,
            status: true,
            claims: {
              select: {
                id: true
              }
            }
          }
        }
      }
    });

    const sessionAction: SessionAction = {
      type: SessionActionEnum.CLOSE,
      payload: result
    };

    if (result.lixi?.claims.length === 0) {
      const notification: NotificationDto = {
        senderId: pageMessageSession.page.pageAccountId,
        recipientId: pageMessageSession.accountId,
        notificationTypeId: NOTIFICATION_TYPES.PAGE_MESSAGE_DENIED,
        level: NotificationLevel.INFO,
        url: `/lixi/${result.lixi.id}`,
        additionalData: {
          pageName: pageMessageSession.page.name,
          lixiAmount: result.lixi.amount.toFixed(0)
        }
      };

      await this.notificationService.saveAndDispatchNotification(notification);
    }

    await this.pageMessageSessionCacheService.removeLatestMessage(pageMessageSession.id);

    this.notificationGateway.publishSessionAction(pageMessageSessionId, sessionAction);

    return result;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => PageMessageSession)
  async openPageMessageSession(@AccountEntity() account: Account, @Args('data') data: OpenPageMessageSessionInput) {
    if (!account) {
      const couldNotFindAccount = this.i18n.t('post.messages.couldNotFindAccount');
      throw new Error(couldNotFindAccount);
    }

    const { pageMessageSessionId } = data;

    const pageMessageSession = await this.prisma.pageMessageSession.findUnique({
      where: {
        id: pageMessageSessionId
      },
      include: {
        page: {
          select: {
            pageAccountId: true,
            name: true
          }
        }
      }
    });

    if (pageMessageSession?.page.pageAccountId !== account.id) {
      return null;
    }

    const result = await this.prisma.$transaction(async prisma => {
      const result = await prisma.pageMessageSession.update({
        where: {
          id: pageMessageSessionId
        },
        data: {
          status: PageMessageSessionStatus.OPEN,
          sessionOpenedAt: new Date()
        },
        include: {
          page: {
            include: {
              pageAccount: true
            }
          },
          account: true,
          lixi: {
            select: {
              id: true,
              name: true,
              amount: true,
              expiryAt: true,
              activationAt: true,
              status: true
            }
          }
        }
      });

      await prisma.lixi.update({
        where: {
          id: result.lixi!.id
        },
        data: {
          status: 'locked',
          previousStatus: result.lixi!.status,
          updatedAt: new Date()
        }
      });

      return result;
    });

    const sessionAction: SessionAction = {
      type: SessionActionEnum.OPEN,
      payload: result
    };

    const notification: NotificationDto = {
      senderId: pageMessageSession.page.pageAccountId,
      recipientId: pageMessageSession.accountId,
      notificationTypeId: NOTIFICATION_TYPES.PAGE_MESSAGE_ACCEPT,
      level: NotificationLevel.INFO,
      url: `/page-message`,
      additionalData: {
        pageName: pageMessageSession.page.name
      }
    };

    await this.notificationService.saveAndDispatchNotification(notification);

    this.notificationGateway.publishSessionAction(pageMessageSessionId, sessionAction);

    return result;
  }

  @ResolveField()
  async lixi(@Parent() pageMessageSession: PageMessageSession) {
    const lixi = await this.prisma.pageMessageSession
      .findUnique({
        where: {
          id: pageMessageSession.id
        }
      })
      .lixi();
    return lixi;
  }

  @ResolveField()
  async account(@Parent() pageMessageSession: PageMessageSession) {
    const account = await this.prisma.pageMessageSession
      .findUnique({
        where: {
          id: pageMessageSession.id
        }
      })
      .account();
    return account;
  }

  @ResolveField()
  async page(@Parent() pageMessageSession: PageMessageSession) {
    const page = await this.prisma.pageMessageSession
      .findUnique({
        where: {
          id: pageMessageSession.id
        }
      })
      .page();
    return page;
  }
}
