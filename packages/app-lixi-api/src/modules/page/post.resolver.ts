import { PubSub } from 'graphql-subscriptions';
import * as _ from 'lodash';
import { InjectMeiliSearch } from 'nestjs-meilisearch';
import { MeiliSearch } from 'meilisearch';
import { I18n, I18nService } from 'nestjs-i18n';
import { PostAccountEntity } from 'src/decorators/postAccount.decorator';
import VError from 'verror';
import {
  Post,
  PaginationArgs,
  PostOrder,
  PostConnection,
  CreatePostInput,
  UpdatePostInput,
  Account,
  Page,
  Token,
  Upload
} from '@bcpros/lixi-models';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  Request,
  UseGuards
} from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { MeiliService } from './meili.service';
import { GqlJwtAuthGuard, GqlJwtAuthGuardByPass } from '../auth/guards/gql-jwtauth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { POSTS } from './constants/meili.constants';
import ConnectionArgs, { getPagingParameters } from '../../common/custom-graphql-relay/connection.args';
import { connectionFromArraySlice } from '../../common/custom-graphql-relay/arrayConnection';
import PostResponse from 'src/common/post.response';
import { PageAccountEntity } from 'src/decorators/pageAccount.decorator';
import { NotificationLevel } from '@bcpros/lixi-prisma';

const pubSub = new PubSub();

@Injectable()
@Resolver(() => Post)
export class PostResolver {
  private logger: Logger = new Logger(this.constructor.name);

  constructor(private prisma: PrismaService, private meiliService: MeiliService, @I18n() private i18n: I18nService) {}

  @Subscription(() => Post)
  postCreated() {
    return pubSub.asyncIterator('postCreated');
  }

  @Query(() => Post)
  async post(@Args('id', { type: () => String }) id: string) {
    return this.prisma.post.findUnique({
      where: { id: id }
    });
  }

  @Query(() => PostConnection)
  @UseGuards(GqlJwtAuthGuardByPass)
  async allPosts(
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
          include: { postAccount: true },
          where: {
            OR: [
              {
                lotusBurnScore: {
                  gte: minBurnFilter ?? 0
                }
              },
              {
                postAccount: {
                  id: accountId
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
            OR: [
              {
                lotusBurnScore: {
                  gte: minBurnFilter ?? 0
                }
              },
              {
                postAccount: {
                  id: accountId
                }
              }
            ]
          }
        }),
      { first, last, before, after }
    );
    return result;
  }

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
          include: { postAccount: true },
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
                    lotusBurnScore: {
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
                    lotusBurnScore: {
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

  @Query(() => PostConnection)
  @UseGuards(GqlJwtAuthGuard)
  async allPostsByPageId(
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
    const page = await this.prisma.page.findUnique({
      where: {
        id: id
      }
    });

    if (account.id === page?.pageAccountId) {
      result = await findManyCursorConnection(
        args =>
          this.prisma.post.findMany({
            include: { postAccount: true },
            where: {
              OR: [
                {
                  postAccountId: account.id
                },
                {
                  AND: [{ pageId: id }, { lotusBurnScore: { gte: minBurnFilter ?? 0 } }]
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
                  postAccountId: account.id
                },
                {
                  AND: [{ pageId: id }, { lotusBurnScore: { gte: minBurnFilter ?? 0 } }]
                }
              ]
            }
          }),
        { first, last, before, after }
      );
    } else {
      result = await findManyCursorConnection(
        args =>
          this.prisma.post.findMany({
            include: { postAccount: true },
            where: {
              AND: [
                {
                  pageId: id
                },
                {
                  lotusBurnScore: {
                    gte: 0
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
                  pageId: id
                },
                {
                  lotusBurnScore: {
                    gte: 0
                  }
                }
              ]
            }
          }),
        { first, last, before, after }
      );
    }

    return result;
  }

  @Query(() => PostResponse, { name: 'allPostsBySearch' })
  async allPostsBySearch(
    @Args() args: ConnectionArgs,
    @Args({ name: 'query', type: () => String, nullable: true })
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
          include: { postAccount: true },
          where: {
            OR: [
              {
                postAccountId: account.id
              },
              {
                AND: [
                  {
                    tokenId: id
                  },
                  {
                    lotusBurnScore: {
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
                postAccountId: account.id
              },
              {
                AND: [
                  {
                    tokenId: id
                  },
                  {
                    lotusBurnScore: {
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
            include: { postAccount: true },
            where: {
              postAccountId: _.toSafeInteger(id)
            },
            orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
            ...args
          }),
        () =>
          this.prisma.post.count({
            where: {
              postAccountId: _.toSafeInteger(id)
            }
          }),
        { first, last, before, after }
      );
    } else {
      result = await findManyCursorConnection(
        args =>
          this.prisma.post.findMany({
            include: { postAccount: true },
            where: {
              OR: [
                {
                  postAccountId: account.id
                },
                {
                  AND: [
                    {
                      postAccountId: _.toSafeInteger(id)
                    },
                    {
                      lotusBurnScore: {
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
              AND: [
                {
                  postAccountId: _.toSafeInteger(id)
                },
                {
                  lotusBurnScore: {
                    gte: 0
                  }
                }
              ]
            }
          }),
        { first, last, before, after }
      );
    }
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
      data: {
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
      }
    };
    const createdPost = await this.prisma.post.create({
      ...postToSave,
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

    const indexedPost = {
      id: createdPost.id,
      content: pureContent,
      postAccountName: createdPost.postAccount.name,
      createdAt: createdPost.createdAt,
      updatedAt: createdPost.updatedAt,
      page: {
        id: createdPost.page?.id,
        name: createdPost.page?.name
      },
      token: {
        id: createdPost.token?.id,
        name: createdPost.token?.name
      }
    };

    await this.meiliService.add(`${process.env.MEILISEARCH_BUCKET}_${POSTS}`, indexedPost, createdPost.id);

    pubSub.publish('postCreated', { postCreated: createdPost });

    return createdPost;
  }

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
      updatedAt: updatedPost.updatedAt
    };

    await this.meiliService.update(`${process.env.MEILISEARCH_BUCKET}_${POSTS}`, indexedPost, updatedPost.id);

    pubSub.publish('postUpdated', { postUpdated: updatedPost });
    return updatedPost;
  }

  @ResolveField('postAccount', () => Account)
  async postAccount(@Parent() post: Post) {
    const account = this.prisma.account.findFirst({
      where: {
        id: post.postAccountId
      }
    });

    return account;
  }

  @ResolveField('pageAccount', () => Account)
  async pageAccount(@Parent() post: Post) {
    let account;
    if (post.pageId) {
      account = this.prisma.account.findFirst({
        where: {
          page: {
            id: post.pageId
          }
        }
      });
    }

    return account;
  }

  @ResolveField('page', () => Page)
  async page(@Parent() post: Post) {
    if (post.pageId) {
      const page = this.prisma.page.findFirst({
        where: {
          id: post.pageId
        }
      });

      return page;
    }
    return null;
  }

  @ResolveField('token', () => Token)
  async token(@Parent() post: Post) {
    if (post.tokenId) {
      const token = this.prisma.token.findFirst({
        where: {
          id: post.tokenId
        }
      });

      return token;
    }
    return null;
  }

  @ResolveField()
  async uploads(@Parent() post: Post) {
    const uploads = this.prisma.uploadDetail.findMany({
      where: {
        postId: post.id
      },
      include: {
        upload: {
          select: {
            id: true,
            sha: true,
            bucket: true,
            width: true,
            height: true
          }
        }
      }
    });
    return uploads;
  }
}
