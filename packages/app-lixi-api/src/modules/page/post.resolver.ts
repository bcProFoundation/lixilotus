import {
  Post,
  PaginationArgs,
  PaginationSearchArgs,
  PostOrder,
  PostConnection,
  CreatePostInput,
  Account,
  UpdatePostInput,
  Page
} from '@bcpros/lixi-models';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { ExecutionContext, HttpException, HttpStatus, Logger, Request, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { PrismaService } from '../prisma/prisma.service';
import * as _ from 'lodash';
import { PostAccountEntity } from 'src/decorators/postAccount.decorator';
import { I18n, I18nService } from 'nestjs-i18n';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwtauth.guard';
import { MeiliSearch } from 'meilisearch';
import VError from 'verror';
const pubSub = new PubSub();

@Resolver(() => Post)
export class PostResolver {
  private logger: Logger = new Logger(this.constructor.name);
  private meiliSearch = new MeiliSearch({ host: 'http://127.0.0.1:7700', apiKey: 'masterKey' });

  constructor(private prisma: PrismaService, @I18n() private i18n: I18nService) {}

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
            OR: !query
              ? undefined
              : {
                  content: { contains: query || '' }
                }
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args
        }),
      () =>
        this.prisma.post.count({
          where: {
            OR: {
              pageId: { contains: query || '' }
            }
          }
        }),
      { first, last, before, after }
    );
    return result;
  }

  @Query(() => PostConnection)
  async searchPosts(
    @Args() { first, skip }: PaginationArgs,
    @Args({ name: 'query', type: () => String, nullable: true })
    query: string,
    @Args({
      name: 'orderBy',
      type: () => PostOrder,
      nullable: true
    })
    orderBy: PostOrder
  ) {
    try {
      const postsIndex = await this.meiliSearch.index('posts').getRawInfo();
      if (!postsIndex) {
        const postNotExist = await this.i18n.t('post.messages.postNotExist');
        throw Error(postNotExist);
      }

      const postsDocsList = await this.meiliSearch.index('posts').search(query);
      console.log('postsDocsList: ', postsDocsList);

      const postsDocsIDs = postsDocsList.hits.map(post => post.id);
      const result = await this.prisma.post.findMany({
        where: {
          id: { in: postsDocsIDs }
        }
      });
      return result;
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Post)
  async createPost(@PostAccountEntity() account: Account, @Args('data') data: CreatePostInput) {
    if (!account) {
      const couldNotFindAccount = await this.i18n.t('post.messages.couldNotFindAccount');
      throw new Error(couldNotFindAccount);
    }

    if (data.pageId) {
    }

    const uploadCoverDetail = data.cover
      ? await this.prisma.uploadDetail.findFirst({
          where: {
            uploadId: data.cover
          }
        })
      : undefined;
    const dataSave = {
      data: {
        content: data.content,
        postAccount: { connect: { id: account.id } },
        cover: { connect: uploadCoverDetail ? { id: uploadCoverDetail.id } : undefined }
      }
    };
    const createdPost = await this.prisma.post.create(dataSave);

    const postsIndex = await this.meiliSearch.index('posts').getRawInfo();
    if (!postsIndex) {
      await this.meiliSearch.createIndex('posts', { primaryKey: 'id' });
    }

    await this.meiliSearch.index('posts').addDocuments([{ createdPost }]);
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

    const uploadCoverDetail = data.cover
      ? await this.prisma.uploadDetail.findFirst({
          where: {
            uploadId: data.cover
          }
        })
      : undefined;

    const updatedPost = await this.prisma.post.update({
      where: {
        id: data.id
      },
      data: {
        ...data,
        cover: { connect: uploadCoverDetail ? { id: uploadCoverDetail.id } : undefined }
      }
    });

    pubSub.publish('postUpdated', { postUpdated: updatedPost });
    return updatedPost;
  }
}
