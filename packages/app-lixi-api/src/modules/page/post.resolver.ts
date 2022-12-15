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
  Account,
  Page,
  Token
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
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwtauth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { POSTS } from './constants/meili.constants';
import ConnectionArgs, { getPagingParameters } from '../../common/custom-graphql-relay/connection.args';
import { connectionFromArraySlice } from '../../common/custom-graphql-relay/arrayConnection';
import PostResponse from 'src/common/post.response';
import { PostService } from './post.service';

const pubSub = new PubSub();

@Injectable()
@Resolver(() => Post)
export class PostResolver {
  private logger: Logger = new Logger(this.constructor.name);

  constructor(
    private prisma: PrismaService,
    private meiliService: MeiliService,
    @I18n() private i18n: I18nService,
    private postService: PostService
  ) {}

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
  async allPosts(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'query', type: () => String, nullable: true })
    query: string,
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
            AND: [
              {
                page: null
              },
              {
                token: null
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
                page: null
              },
              {
                token: null
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
    return result;
  }

  @Query(() => PostConnection)
  async allPostsByPageId(
    @Args() { after, before, first, last }: PaginationArgs,
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
            pageId: id
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args
        }),
      () =>
        this.prisma.post.count({
          where: {
            pageId: id
          }
        }),
      { first, last, before, after }
    );
    return result;
  }

  @Query(() => PostResponse, { name: 'allPostsBySearch' })
  async allPostsBySearch(
    @Args() args: ConnectionArgs,
    @Args({ name: 'query', type: () => String, nullable: true })
    query: string
  ): Promise<PostResponse> {
    const { limit, offset } = getPagingParameters(args);
    const [posts, count] = await this.postService.findAll(limit!, offset!, query);
    return connectionFromArraySlice(posts, args, {
      arrayLength: count,
      sliceStart: offset || 0
    });
  }

  @Query(() => PostConnection)
  async allPostsByTokenId(
    @Args() { after, before, first, last }: PaginationArgs,
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
            tokenId: id
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args
        }),
      () =>
        this.prisma.post.count({
          where: {
            tokenId: id
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
    @Args() { after, before, first, last }: PaginationArgs,
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

    const { uploadCovers, pageId, content, tokenId } = data;

    //Because of the current implementation of editor, the following code will
    //extract img tag fromt the content and query it from database
    //If match it will connect UploadDetail to the current post

    let uploadDetailIds: any[] = [];
    let imgSources: string[] = [];
    let imgShas: string[] = [];

    //Look up for the img tag
    const imgTags = content.match(/<img [^>]*src="[^"]*"[^>]*>/gm);

    //If there is img tag, extract the src field from it
    if (imgTags !== null) {
      imgSources = imgTags.map(x => x.replace(/.*src="([^"]*)".*/, '$1'));
    }

    //After that, look for sha from url and add to array of sha, in this case imgShas
    if (imgSources.length > 0) {
      imgShas = imgSources.map((sha: string) => {
        return /[^/]*$/.exec(sha)![0];
      });
    }

    //Query the imgShas from the database, if there is then add to UploadDetailsIds
    if (imgShas.length > 0) {
      const promises = imgShas.map(async (sha: string) => {
        const upload = await this.prisma.upload.findFirst({
          where: {
            sha: sha
          },
          include: {
            uploadDetail: true
          }
        });

        return upload && upload?.uploadDetail?.id;
      });

      uploadDetailIds = await Promise.all(promises);
    }

    const postToSave = {
      data: {
        content: content,
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
          connect: tokenId ? { tokenId: tokenId } : undefined
        }
      }
    };
    const createdPost = await this.prisma.post.create({
      ...postToSave,
      include: {
        page: {
          select: {
            address: true,
            name: true
          }
        },
        token: {
          select: {
            name: true
          }
        },
        postAccount: {
          select: {
            name: true,
            address: true
          }
        }
      }
    });

    //TODO: Strip html from content before adding to meilisearch. Do later with new editor

    await this.meiliService.add(POSTS, _.omit(createdPost, ['postAccountId', 'pageId', 'tokenId']), createdPost.id);

    pubSub.publish('postCreated', { postCreated: createdPost });
    return createdPost;
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
    const account = this.prisma.account.findFirst({
      where: {
        id: post.pageAccountId
      }
    });

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
}
