import {
  Account,
  CreatePostInput,
  Page,
  PaginationArgs,
  Post,
  PostConnection,
  PostOrder,
  PostTranslation,
  Repost,
  RepostInput,
  Token,
  UpdatePostInput,
  UploadDetail
} from '@bcpros/lixi-models';
import { NotificationLevel } from '@bcpros/lixi-prisma';
import BCHJS from '@bcpros/xpi-js';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpException, HttpStatus, Inject, Injectable, Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { SkipThrottle } from '@nestjs/throttler';
import { ChronikClient } from 'chronik-client';
import { PubSub } from 'graphql-subscriptions';
import { Redis } from 'ioredis';
import * as _ from 'lodash';
import { I18n, I18nService } from 'nestjs-i18n';
import { InjectChronikClient } from 'src/common/modules/chronik/chronik.decorators';
import { NOTIFICATION_TYPES } from 'src/common/modules/notifications/notification.constants';
import { NotificationService } from 'src/common/modules/notifications/notification.service';
import PostResponse from 'src/common/post.response';
import { PostAccountEntity } from 'src/decorators/postAccount.decorator';
import { GqlHttpExceptionFilter } from 'src/middlewares/gql.exception.filter';
import VError from 'verror';
import { connectionFromArraySlice } from '../../common/custom-graphql-relay/arrayConnection';
import ConnectionArgs, { getPagingParameters } from '../../common/custom-graphql-relay/connection.args';
import { FollowCacheService } from '../account/follow-cache.service';
import { GqlJwtAuthGuard, GqlJwtAuthGuardByPass } from '../auth/guards/gql-jwtauth.guard';
import { HashtagService } from '../hashtag/hashtag.service';
import { PrismaService } from '../prisma/prisma.service';
import { HASHTAG, POSTS } from './constants/meili.constants';
import { MeiliService } from './meili.service';

const pubSub = new PubSub();

@Injectable()
@Resolver(() => Post)
@UseFilters(GqlHttpExceptionFilter)
export class PostResolver {
  private logger: Logger = new Logger(this.constructor.name);

  constructor(
    private readonly followCacheService: FollowCacheService,
    private prisma: PrismaService,
    private meiliService: MeiliService,
    @InjectRedis() private readonly redis: Redis,
    private readonly notificationService: NotificationService,
    private hashtagService: HashtagService,
    @Inject('xpijs') private XPI: BCHJS,
    @InjectChronikClient('xpi') private chronik: ChronikClient,
    @I18n() private i18n: I18nService
  ) { }

  @Subscription(() => Post)
  postCreated() {
    return pubSub.asyncIterator('postCreated');
  }

  @SkipThrottle()
  @Query(() => Post)
  async post(@Args('id', { type: () => String }) id: string) {
    return await this.prisma.post.findUnique({
      where: { id: id },
      include: {
        postAccount: true,
        comments: true,
        page: true,
        translations: true,
        reposts: { select: { account: true, accountId: true } }
      }
    });
  }

  @SkipThrottle()
  @Query(() => PostConnection)
  @UseGuards(GqlJwtAuthGuardByPass)
  async allPosts(
    @PostAccountEntity() account: Account,
    @Args() { after, before, first, last, minBurnFilter }: PaginationArgs,
    @Args({ name: 'accountId', type: () => Number, nullable: true }) accountId: number,
    @Args({ name: 'isTop', type: () => String, nullable: true }) isTop: string,
    @Args({ name: 'orderBy', type: () => [PostOrder!], nullable: true }) orderBy: PostOrder[]
  ) {
    let result;

    if (account) {
      if (accountId && !_.isNil(account) && accountId !== account.id) {
        const invalidAccountMessage = await this.i18n.t('account.messages.invalidAccount');
        throw new VError(invalidAccountMessage);
      }

      const followingsAccount = await this.prisma.followAccount.findMany({
        where: { followerAccountId: account.id },
        select: { followingAccountId: true }
      });
      const listFollowingsAccountIds = followingsAccount.map(item => item.followingAccountId);

      // const listFollowingsAccountIds = await this.followCacheService.getAccountFollowings(accountId);

      const followingPagesAccount = await this.prisma.followPage.findMany({
        where: { accountId: account.id },
        select: { pageId: true, tokenId: true }
      });
      const listFollowingsPageIds = followingPagesAccount.map(item => item.pageId || item.tokenId);

      const queryPosts: any = {
        OR: [
          {
            danaBurnScore: { gte: minBurnFilter ?? 0 }
          },
          {
            postAccount: { id: account.id }
          },
          ...(isTop == 'true'
            ? [{ AND: [{ postAccount: { id: { in: listFollowingsAccountIds } } }, { danaBurnScore: { gte: 0 } }] }]
            : []),
          ...(isTop == 'true'
            ? [{ AND: [{ pageId: { in: listFollowingsPageIds } }, { danaBurnScore: { gte: 1 } }] }]
            : [])
        ]
      };

      result = await findManyCursorConnection(
        async args => {
          const posts = await this.prisma.post.findMany({
            include: {
              postAccount: true,
              comments: true,
              page: true,
              translations: true,
              reposts: { select: { account: true, accountId: true } }
            },
            where: queryPosts,
            orderBy: orderBy ? orderBy.map(item => ({ [item.field]: item.direction })) : undefined,
            ...args
          });

          const result = await Promise.all(
            posts.map(async post => ({
              ...post,
              followPostOwner: listFollowingsAccountIds.includes(post.postAccountId) ? true : false,
              followedPage: post.page && listFollowingsPageIds.includes(post.page.id) ? true : false,
              repostCount: await this.prisma.repost.count({
                where: { postId: post.id }
              })
            }))
          );

          return result;
        },
        () =>
          this.prisma.post.count({
            where: queryPosts
          }),
        { first, last, before, after }
      );
    } else {
      result = await findManyCursorConnection(
        args =>
          this.prisma.post.findMany({
            include: { postAccount: true, comments: true, translations: true },
            where: {
              danaBurnScore: {
                gte: minBurnFilter ?? 0
              }
            },
            orderBy: orderBy ? orderBy.map(item => ({ [item.field]: item.direction })) : undefined,
            ...args
          }),
        () =>
          this.prisma.post.count({
            where: {
              danaBurnScore: {
                gte: minBurnFilter ?? 0
              }
            }
          }),
        { first, last, before, after }
      );
    }
    return result;
  }

  @SkipThrottle()
  @Query(() => PostConnection)
  @UseGuards(GqlJwtAuthGuardByPass)
  async allOrphanPosts(
    @PostAccountEntity() account: Account,
    @Args() { after, before, first, last, minBurnFilter }: PaginationArgs,
    @Args({ name: 'query', type: () => String, nullable: true })
    accountId: number,
    @Args({
      name: 'orderBy',
      type: () => PostOrder,
      nullable: true
    })
    orderBy: PostOrder
  ) {
    if (accountId && !_.isNil(account) && accountId !== account.id) {
      const invalidAccountMessage = await this.i18n.t('account.messages.invalidAccount');
      throw new VError(invalidAccountMessage);
    }

    const result = await findManyCursorConnection(
      args =>
        this.prisma.post.findMany({
          include: { postAccount: true, comments: true, translations: true },
          where: {
            OR: [
              { postAccountId: accountId },
              {
                AND: [
                  {
                    page: null
                  },
                  {
                    token: null
                  },
                  {
                    danaBurnScore: {
                      gte: minBurnFilter ?? 0
                    }
                  }
                ]
              }
            ]
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args
        }),
      () =>
        this.prisma.post.count({
          where: {
            OR: [
              { postAccountId: accountId },
              {
                AND: [
                  {
                    page: null
                  },
                  {
                    token: null
                  },
                  {
                    danaBurnScore: {
                      gte: minBurnFilter ?? 0
                    }
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

  @SkipThrottle()
  @Query(() => PostConnection)
  @UseGuards(GqlJwtAuthGuardByPass)
  async allPostsByPageId(
    @PostAccountEntity() account: Account,
    @Args() { after, before, first, last, minBurnFilter }: PaginationArgs,
    @Args({ name: 'id', type: () => String, nullable: true })
    id: string,
    @Args({
      name: 'orderBy',
      type: () => [PostOrder!],
      nullable: true
    })
    orderBy: PostOrder[]
  ) {
    let result;
    const page = await this.prisma.page.findFirst({
      where: {
        id: id
      }
    });

    if (!account) {
      result = await findManyCursorConnection(
        args =>
          this.prisma.post.findMany({
            include: {
              postAccount: true,
              comments: true,
              reposts: { select: { account: true, accountId: true } },
              translations: true
            },
            where: {
              OR: [
                {
                  pageId: id
                },
                {
                  AND: [{ pageId: id }, { danaBurnScore: { gte: minBurnFilter ?? 0 } }]
                }
              ]
            },
            orderBy: orderBy ? orderBy.map(item => ({ [item.field]: item.direction })) : undefined,
            ...args
          }),
        () =>
          this.prisma.post.count({
            where: {
              OR: [
                {
                  pageId: id
                },
                {
                  AND: [{ pageId: id }, { danaBurnScore: { gte: minBurnFilter ?? 0 } }]
                }
              ]
            }
          }),
        { first, last, before, after }
      );

      return result;
    }

    if (account?.id === page?.pageAccountId) {
      result = await findManyCursorConnection(
        async args => {
          const posts = await this.prisma.post.findMany({
            include: {
              postAccount: true,
              comments: true,
              reposts: { select: { account: true, accountId: true } },
              translations: true
            },
            where: {
              OR: [
                {
                  AND: [{ postAccountId: account.id }, { pageId: id }]
                },
                {
                  AND: [{ pageId: id }, { danaBurnScore: { gte: minBurnFilter ?? 0 } }]
                }
              ]
            },
            orderBy: orderBy ? orderBy.map(item => ({ [item.field]: item.direction })) : undefined,
            ...args
          });

          const result = await Promise.all(
            posts.map(async post => ({
              ...post,
              repostCount: await this.prisma.repost.count({
                where: { postId: post.id }
              })
            }))
          );

          return result;
        },
        () =>
          this.prisma.post.count({
            where: {
              OR: [
                {
                  AND: [{ postAccountId: account.id }, { pageId: id }]
                },
                {
                  AND: [{ pageId: id }, { danaBurnScore: { gte: minBurnFilter ?? 0 } }]
                }
              ]
            }
          }),
        { first, last, before, after }
      );
    } else if (account) {
      result = await findManyCursorConnection(
        args =>
          this.prisma.post.findMany({
            include: {
              postAccount: true,
              comments: true,
              reposts: { select: { account: true, accountId: true } },
              translations: true
            },
            where: {
              OR: [
                {
                  AND: [{ postAccountId: account.id }, { pageId: id }]
                },
                {
                  AND: [{ pageId: id }, { danaBurnScore: { gte: minBurnFilter ?? 0 } }]
                }
              ]
            },
            orderBy: orderBy ? orderBy.map(item => ({ [item.field]: item.direction })) : undefined,
            ...args
          }),
        () =>
          this.prisma.post.count({
            where: {
              OR: [
                {
                  AND: [{ postAccountId: account.id }, { pageId: id }]
                },
                {
                  AND: [{ pageId: id }, { danaBurnScore: { gte: minBurnFilter ?? 0 } }]
                }
              ]
            }
          }),
        { first, last, before, after }
      );
    }

    return result;
  }

  @SkipThrottle()
  @Query(() => PostResponse, { name: 'allPostsBySearch' })
  async allPostsBySearch(
    @Args() args: ConnectionArgs,
    @Args({ name: 'query', type: () => String, nullable: true })
    @Args({ name: 'minBurnFilter', type: () => Int, nullable: true })
    query: string
  ): Promise<PostResponse> {
    const { limit, offset } = getPagingParameters(args);

    const count = await this.meiliService.searchByQueryEstimatedTotalHits(
      `${process.env.MEILISEARCH_BUCKET}_${POSTS}`,
      query
    );

    const posts = await this.meiliService.searchByQueryHits(
      `${process.env.MEILISEARCH_BUCKET}_${POSTS}`,
      query,
      offset!,
      limit!
    );

    const postsId = _.map(posts, 'id');

    const searchPosts = await this.prisma.post.findMany({
      where: {
        id: { in: postsId }
      }
    });

    return connectionFromArraySlice(searchPosts, args, {
      arrayLength: count || 0,
      sliceStart: offset || 0
    });
  }

  @SkipThrottle()
  @Query(() => PostResponse, { name: 'allPostsBySearchWithHashtag' })
  async allPostsBySearchWithHashtag(
    @Args({ name: 'minBurnFilter', type: () => Int, nullable: true })
    minBurnFilter: number,
    @Args()
    args: ConnectionArgs,
    @Args() { after, before, first, last }: PaginationArgs,

    @Args({ name: 'query', type: () => String, nullable: true })
    query: string,
    @Args({ name: 'hashtags', type: () => [String], nullable: true })
    hashtags: string[],
    @Args({
      name: 'orderBy',
      type: () => PostOrder,
      nullable: true
    })
    orderBy: PostOrder
  ): Promise<PostResponse | undefined> {
    try {
      const { limit, offset } = getPagingParameters(args);

      const count = await this.hashtagService.searchByQueryEstimatedTotalHits(
        `${process.env.MEILISEARCH_BUCKET}_${POSTS}`,
        query,
        hashtags
      );

      const posts = await this.hashtagService.searchByQueryHits(
        `${process.env.MEILISEARCH_BUCKET}_${POSTS}`,
        query,
        hashtags,
        offset!,
        limit!
      );

      const postsId = _.map(posts, 'id');

      //Testing new implement of searching

      // const searchPosts = await this.prisma.post.findMany({
      //   include: { translations: true },
      //   where: {
      //     AND: [
      //       {
      //         id: { in: postsId }
      //       },
      //       {
      //         danaBurnScore: {
      //           gte: minBurnFilter ?? 0
      //         }
      //       }
      //     ]
      //   },
      //   orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined
      // });

      const result = await findManyCursorConnection(
        args =>
          this.prisma.post.findMany({
            include: { translations: true },
            where: {
              AND: [
                {
                  id: { in: postsId }
                },
                {
                  danaBurnScore: {
                    gte: minBurnFilter ?? 0
                  }
                }
              ]
            },
            orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
            ...args
          }),
        () =>
          this.prisma.post.count({
            where: {
              AND: [
                {
                  id: { in: postsId }
                },
                {
                  danaBurnScore: {
                    gte: minBurnFilter ?? 0
                  }
                }
              ]
            },
            orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined
          }),
        { first, last, before, after }
      );
      return result;

      // return connectionFromArraySlice(searchPosts, args, {
      //   arrayLength: count || 0,
      //   sliceStart: offset || 0
      // });
    } catch (err) {
      this.logger.error(err);
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @SkipThrottle()
  @Query(() => PostResponse, { name: 'allPostsBySearchWithHashtagAtPage' })
  async allPostsBySearchWithHashtagAtPage(
    @Args({ name: 'minBurnFilter', type: () => Int, nullable: true })
    minBurnFilter: number,
    @Args()
    args: ConnectionArgs,
    @Args({ name: 'query', type: () => String, nullable: true })
    query: string,
    @Args({ name: 'hashtags', type: () => [String], nullable: true })
    hashtags: string[],
    @Args({ name: 'pageId', type: () => String, nullable: true })
    pageId: string,
    @Args({
      name: 'orderBy',
      type: () => PostOrder,
      nullable: true
    })
    orderBy: PostOrder
  ) {
    const { limit, offset } = getPagingParameters(args);

    const count = await this.hashtagService.searchByQueryEstimatedTotalHitsAtPage(
      `${process.env.MEILISEARCH_BUCKET}_${POSTS}`,
      query,
      hashtags,
      pageId
    );

    const posts = await this.hashtagService.searchByQueryHitsAtPage(
      `${process.env.MEILISEARCH_BUCKET}_${POSTS}`,
      query,
      hashtags,
      pageId,
      offset!,
      limit!
    );

    const postsId = _.map(posts, 'id');

    const searchPosts = await this.prisma.post.findMany({
      include: { translations: true },
      where: {
        AND: [
          {
            id: { in: postsId }
          },
          {
            danaBurnScore: {
              gte: minBurnFilter ?? 0
            }
          }
        ]
      },
      orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined
    });

    return connectionFromArraySlice(searchPosts, args, {
      arrayLength: count || 0,
      sliceStart: offset || 0
    });
  }

  @SkipThrottle()
  @Query(() => PostResponse, { name: 'allPostsBySearchWithHashtagAtToken' })
  async allPostsBySearchWithHashtagAtToken(
    @Args({ name: 'minBurnFilter', type: () => Int, nullable: true })
    minBurnFilter: number,
    @Args()
    args: ConnectionArgs,
    @Args({ name: 'query', type: () => String, nullable: true })
    query: string,
    @Args({ name: 'hashtags', type: () => [String], nullable: true })
    hashtags: string[],
    @Args({ name: 'tokenId', type: () => String, nullable: true })
    tokenId: string,
    @Args({
      name: 'orderBy',
      type: () => PostOrder,
      nullable: true
    })
    orderBy: PostOrder
  ) {
    const { limit, offset } = getPagingParameters(args);

    const count = await this.hashtagService.searchByQueryEstimatedTotalHitsAtToken(
      `${process.env.MEILISEARCH_BUCKET}_${POSTS}`,
      query,
      hashtags,
      tokenId
    );

    const posts = await this.hashtagService.searchByQueryHitsAtToken(
      `${process.env.MEILISEARCH_BUCKET}_${POSTS}`,
      query,
      hashtags,
      tokenId,
      offset!,
      limit!
    );

    const postsId = _.map(posts, 'id');

    const searchPosts = await this.prisma.post.findMany({
      include: { translations: true },
      where: {
        AND: [
          {
            id: { in: postsId }
          },
          {
            danaBurnScore: {
              gte: minBurnFilter ?? 0
            }
          }
        ]
      },
      orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined
    });

    return connectionFromArraySlice(searchPosts, args, {
      arrayLength: count || 0,
      sliceStart: offset || 0
    });
  }

  @SkipThrottle()
  @Query(() => PostConnection)
  @UseGuards(GqlJwtAuthGuard)
  async allPostsByTokenId(
    @PostAccountEntity() account: Account,
    @Args() { after, before, first, last, minBurnFilter }: PaginationArgs,
    @Args({ name: 'id', type: () => String, nullable: true })
    id: string,
    @Args({
      name: 'orderBy',
      type: () => PostOrder,
      nullable: true
    })
    orderBy: PostOrder
  ) {
    const result = await findManyCursorConnection(
      args =>
        this.prisma.post.findMany({
          include: { postAccount: true, comments: true, translations: true },
          where: {
            OR: [
              {
                AND: [{ postAccountId: account.id }, { tokenId: id }]
              },
              {
                AND: [
                  {
                    tokenId: id
                  },
                  {
                    danaBurnScore: {
                      gte: minBurnFilter ?? 0
                    }
                  }
                ]
              }
            ]
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args
        }),
      () =>
        this.prisma.post.count({
          where: {
            OR: [
              {
                AND: [{ postAccountId: account.id }, { tokenId: id }]
              },
              {
                AND: [
                  {
                    tokenId: id
                  },
                  {
                    danaBurnScore: {
                      gte: minBurnFilter ?? 0
                    }
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

  @SkipThrottle()
  @Query(() => PostConnection)
  @UseGuards(GqlJwtAuthGuard)
  async allPostsByUserId(
    @PostAccountEntity() account: Account,
    @Args() { after, before, first, last, minBurnFilter }: PaginationArgs,
    @Args({ name: 'id', type: () => String, nullable: true })
    id: string,
    @Args({
      name: 'orderBy',
      type: () => PostOrder,
      nullable: true
    })
    orderBy: PostOrder
  ) {
    let result;
    if (account.id === _.toSafeInteger(id)) {
      result = await findManyCursorConnection(
        args =>
          this.prisma.post.findMany({
            include: { postAccount: true, comments: true, translations: true },
            where: {
              AND: [
                {
                  postAccountId: _.toSafeInteger(id)
                },
                {
                  danaBurnScore: {
                    gte: minBurnFilter ?? 0
                  }
                },
                { pageId: null },
                { tokenId: null }
              ]
            },
            orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
            ...args
          }),
        () =>
          this.prisma.post.count({
            where: {
              AND: [
                {
                  postAccountId: _.toSafeInteger(id)
                },
                {
                  danaBurnScore: {
                    gte: minBurnFilter ?? 0
                  }
                },
                { pageId: null },
                { tokenId: null }
              ]
            }
          }),
        { first, last, before, after }
      );
    } else {
      result = await findManyCursorConnection(
        args =>
          this.prisma.post.findMany({
            include: { postAccount: true, page: false, token: false, translations: true },
            where: {
              AND: [
                {
                  postAccountId: _.toSafeInteger(id)
                },
                {
                  danaBurnScore: {
                    gte: minBurnFilter ?? 0
                  }
                },
                { pageId: null },
                { tokenId: null }
              ]
            },
            orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
            ...args
          }),
        () =>
          this.prisma.post.count({
            where: {
              AND: [
                {
                  postAccountId: _.toSafeInteger(id)
                },
                {
                  danaBurnScore: {
                    gte: minBurnFilter ?? 0
                  }
                },
                { pageId: null },
                { tokenId: null }
              ]
            }
          }),
        { first, last, before, after }
      );
    }
    return result;
  }

  @SkipThrottle()
  @Query(() => PostConnection)
  @UseGuards(GqlJwtAuthGuardByPass)
  async allPostsByHashtagId(
    @PostAccountEntity() account: Account,
    @Args() { after, before, first, last, minBurnFilter }: PaginationArgs,
    @Args({ name: 'id', type: () => String, nullable: true })
    hashtagId: string,
    @Args({
      name: 'orderBy',
      type: () => PostOrder,
      nullable: true
    })
    orderBy: PostOrder
  ) {
    const result = await findManyCursorConnection(
      args =>
        this.prisma.post.findMany({
          include: { postAccount: true, comments: true, postHashtags: true, translations: true },
          where: {
            postHashtags: {
              some: {
                hashtagId: hashtagId
              }
            }
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args
        }),
      () =>
        this.prisma.post.count({
          where: {
            postHashtags: {
              some: {
                hashtagId: hashtagId
              }
            }
          }
        }),
      { first, last, before, after }
    );
    return result;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Post)
  async createPost(@PostAccountEntity() account: Account, @Args('data') data: CreatePostInput) {
    if (!account) {
      const couldNotFindAccount = await this.i18n.t('post.messages.couldNotFindAccount');
      throw new Error(couldNotFindAccount);
    }

    const { uploadCovers, pageId, htmlContent, tokenPrimaryId, pureContent } = data;

    let uploadDetailIds: any[] = [];

    const promises = uploadCovers.map(async (id: string) => {
      const uploadDetails = await this.prisma.uploadDetail.findFirst({
        where: {
          uploadId: id
        }
      });

      return uploadDetails && uploadDetails.id;
    });

    uploadDetailIds = await Promise.all(promises);

    const postToSave = {
      content: htmlContent,
      postAccount: { connect: { id: account.id } },
      uploadedCovers: {
        connect:
          uploadDetailIds.length > 0
            ? uploadDetailIds.map((uploadDetail: any) => {
              return {
                id: uploadDetail
              };
            })
            : undefined
      },
      page: {
        connect: pageId ? { id: pageId } : undefined
      },
      token: {
        connect: tokenPrimaryId ? { id: tokenPrimaryId } : undefined
      }
    };

    let createFee: any;
    if (data.createFeeHex) {
      const txData = await this.XPI.RawTransactions.decodeRawTransaction(data.createFeeHex);
      createFee = txData['vout'][0].value;
      if (Number(createFee) < 0) {
        throw new Error('Syntax error. Number cannot be less than or equal to 0');
      }
    }

    const savedPost = await this.prisma.$transaction(async prisma => {
      let txid: string | undefined;
      if (data.createFeeHex) {
        const broadcastResponse = await this.chronik.broadcastTx(data.createFeeHex);
        if (!broadcastResponse) {
          throw new Error('Empty chronik broadcast response');
        }
        txid = broadcastResponse.txid;
      }

      const createdPost = await prisma.post.create({
        data: {
          ...postToSave,
          txid: txid,
          createFee: createFee
        },
        include: {
          page: {
            select: {
              id: true,
              address: true,
              name: true
            }
          },
          token: {
            select: {
              id: true,
              name: true
            }
          },
          postAccount: {
            select: {
              id: true,
              name: true,
              address: true
            }
          }
        }
      });

      return createdPost;
    });

    //Hashtag
    const hashtags = await this.hashtagService.extractAndSave(
      `${process.env.MEILISEARCH_BUCKET}_${HASHTAG}`,
      pureContent,
      savedPost.id
    );

    const indexedPost = {
      id: savedPost.id,
      content: pureContent,
      postAccountName: savedPost.postAccount.name,
      createdAt: savedPost.createdAt,
      updatedAt: savedPost.updatedAt,
      page: {
        id: savedPost.page?.id,
        name: savedPost.page?.name
      },
      token: {
        id: savedPost.token?.id,
        name: savedPost.token?.name
      },
      hashtag: hashtags
    };

    await this.meiliService.add(`${process.env.MEILISEARCH_BUCKET}_${POSTS}`, indexedPost, savedPost.id);

    pubSub.publish('postCreated', { postCreated: savedPost });
    let listAccountFollowerIds: number[] = [];
    // Notification
    if (pageId && savedPost) {
      const page = await this.prisma.page.findFirst({
        where: {
          id: pageId
        }
      });

      if (!page) {
        const accountNotExistMessage = await this.i18n.t('page.messages.couldNotFindPage');
        throw new VError(accountNotExistMessage);
      }

      const recipient = await this.prisma.account.findFirst({
        where: {
          id: _.toSafeInteger(page.pageAccountId)
        }
      });

      if (!recipient) {
        const accountNotExistMessage = await this.i18n.t('account.messages.accountNotExist');
        throw new VError(accountNotExistMessage);
      }

      const createNotif = {
        senderId: account.id,
        recipientId: Number(page?.pageAccountId),
        notificationTypeId: NOTIFICATION_TYPES.POST_ON_PAGE,
        level: NotificationLevel.INFO,
        url: `/post/${savedPost.id}`,
        additionalData: {
          senderName: account.name,
          senderAddress: account.address,
          senderAvatar: account.avatar,
          pageName: savedPost?.page?.name
        }
      };
      const jobData = {
        notification: createNotif
      };
      createNotif.senderId !== createNotif.recipientId &&
        (await this.notificationService.saveAndDispatchNotification(jobData.notification));

      // collect account id follow page
      const followerPageIds = await this.followCacheService.getPageFollowers(page.id);
      if (followerPageIds && followerPageIds.length > 0) {
        const followerPageIdsMapped = followerPageIds.map(id => Number(id));
        listAccountFollowerIds = listAccountFollowerIds.concat(followerPageIdsMapped);
      }
    }
    // collect account id follow this account
    const followerAccountIds = await this.followCacheService.getAccountFollowers(account.id);
    if (followerAccountIds && followerAccountIds.length > 0) {
      const followerAccountIdsMapped = followerAccountIds.map(id => Number(id));
      listAccountFollowerIds = listAccountFollowerIds.concat(followerAccountIdsMapped);
    }
    if (listAccountFollowerIds && listAccountFollowerIds.length > 0) {
      // filter account duplicate
      listAccountFollowerIds = listAccountFollowerIds.filter(
        (value, index) => listAccountFollowerIds.indexOf(value) === index
      );
      // filter out main account of follower list
      listAccountFollowerIds = listAccountFollowerIds.filter(id => id !== account.id);
      const followerDetails = await this.prisma.account.findMany({
        where: { id: { in: listAccountFollowerIds } },
        select: { address: true }
      });
      if (followerDetails && followerDetails.length > 0) {
        const addressFollowerAccountDetails = followerDetails.map(item => item.address);
        const createNotiNewPost = {
          recipientAddresses: addressFollowerAccountDetails
        };
        await this.notificationService.saveAnddDispathNotificationNewPost(createNotiNewPost);
      }
    }

    return savedPost;
  }

  @SkipThrottle()
  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Post)
  async updatePost(@PostAccountEntity() account: Account, @Args('data') data: UpdatePostInput) {
    if (!account) {
      const couldNotFindAccount = await this.i18n.t('post.messages.couldNotFindAccount');
      throw new Error(couldNotFindAccount);
    }

    const { id, htmlContent, pureContent } = data;

    const post = await this.prisma.post.findUnique({
      where: {
        id: id
      },
      include: {
        postAccount: {
          select: {
            address: true
          }
        }
      }
    });

    if (post?.postAccount.address !== account.address) {
      const noPermissionToUpdate = await this.i18n.t('post.messages.noPermissionToUpdate');
      throw new Error(noPermissionToUpdate);
    }

    if (post?.danaBurnScore !== 0) {
      const noPermissionToUpdate = await this.i18n.t('post.messages.noPermissionToUpdate');
      throw new Error(noPermissionToUpdate);
    }

    //Hashtag
    const hashtags = await this.hashtagService.extractAndSave(
      `${process.env.MEILISEARCH_BUCKET}_${HASHTAG}`,
      pureContent,
      post.id
    );

    const updatedPost = await this.prisma.post.update({
      where: {
        id: id
      },
      data: {
        content: htmlContent,
        updatedAt: new Date()
      }
    });

    const indexedPost = {
      id: updatedPost.id,
      content: pureContent,
      updatedAt: updatedPost.updatedAt,
      hashtag: hashtags
    };

    // Clear the post from cache
    const hashPrefix = `posts:item-data`;
    await this.redis.hdel(hashPrefix, id);

    await this.meiliService.update(`${process.env.MEILISEARCH_BUCKET}_${POSTS}`, indexedPost, updatedPost.id);

    pubSub.publish('postUpdated', { postUpdated: updatedPost });
    return updatedPost;
  }

  @SkipThrottle()
  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Boolean)
  async repost(@PostAccountEntity() account: Account, @Args('data') data: RepostInput) {
    if (!account) {
      const couldNotFindAccount = await this.i18n.t('post.messages.couldNotFindAccount');
      throw new Error(couldNotFindAccount);
    }

    if (account.id !== data.accountId) {
      const noPermission = await this.i18n.t('account.messages.noPermission');
      throw new Error(noPermission);
    }

    let repostFee: any;
    if (data.txHex) {
      const txData = await this.XPI.RawTransactions.decodeRawTransaction(data.txHex);
      repostFee = txData['vout'][0].value;
      if (Number(repostFee) <= 0) {
        throw new Error('Syntax error. Number cannot be less than or equal to 0');
      }
    }

    const reposted = await this.prisma.$transaction(async prisma => {
      let txid = null;
      if (data.txHex) {
        const broadcastResponse = await this.chronik.broadcastTx(data.txHex).catch(async err => {
          throw new Error('Empty chronik broadcast response');
        });
        txid = broadcastResponse.txid;
      }

      const updatePost = await prisma.post.update({
        where: { id: data.postId },

        data: {
          lastRepostAt: new Date(),
          reposts: {
            create: {
              accountId: account.id,
              repostFee: repostFee,
              txid: txid
            }
          }
        }
      });

      return updatePost;
    });

    return reposted ? true : false;
  }

  @ResolveField('reposts', () => Repost)
  async reposts(@Parent() post: Post) {
    const reposts = await this.prisma.post
      .findUnique({
        where: {
          id: post.id
        }
      })
      .reposts();
    return reposts;
  }

  @ResolveField('repostCount', () => Number)
  async repostCount(@Parent() post: Post) {
    const repostCount = await this.prisma.repost.count({
      where: {
        postId: post.id
      }
    });

    return repostCount;
  }

  @ResolveField('postAccount', () => Account)
  async postAccount(@Parent() post: Post) {
    const account = await this.prisma.post
      .findUnique({
        where: {
          id: post.id
        }
      })
      .postAccount();

    return account;
  }

  @ResolveField('totalComments', () => Number)
  async postComments(@Parent() post: Post) {
    const totalComments = await this.prisma.comment.count({
      where: {
        commentToId: post.id
      }
    });

    return totalComments;
  }

  @ResolveField('page', () => Page)
  async page(@Parent() post: Post) {
    if (post.pageId) {
      const page = await this.prisma.post
        .findUnique({
          where: {
            id: post.id
          }
        })
        .page();

      return page;
    }
    return null;
  }

  @ResolveField('token', () => Token)
  async token(@Parent() post: Post) {
    if (post.tokenId) {
      const token = await this.prisma.post
        .findUnique({
          where: {
            id: post.id
          }
        })
        .token();

      return token;
    }
    return null;
  }

  @ResolveField('translations', () => [PostTranslation])
  async translations(@Parent() post: Post) {
    if (post.translations) {
      const translations = await this.prisma.post
        .findUnique({
          where: {
            id: post.id
          }
        })
        .translations();

      return translations;
    }
    return null;
  }

  @ResolveField('uploads', () => [UploadDetail])
  async uploads(@Parent() post: Post) {
    const uploads = await this.prisma.post
      .findUnique({
        where: {
          id: post.id
        }
      })
      .uploads({
        include: {
          upload: {
            select: {
              id: true,
              sha: true,
              bucket: true,
              width: true,
              height: true,
              cfImageId: true,
              cfImageFilename: true
            }
          }
        }
      });

    return uploads;
  }
}
