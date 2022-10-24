import {
  Post,
  PaginationArgs,
  PostOrder,
  PostConnection,
  CreatePostInput,
  Account,
  UpdatePostInput,
  Page
} from '@bcpros/lixi-models';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { ExecutionContext, Logger, Request, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { PrismaService } from '../prisma/prisma.service';
import * as _ from 'lodash';
import { PostAccountEntity } from 'src/decorators/postAccount.decorator';
import { I18n, I18nService } from 'nestjs-i18n';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwtauth.guard';

const pubSub = new PubSub();

@Resolver(() => Post)
export class PostResolver {
  private logger: Logger = new Logger(this.constructor.name);

  constructor(private prisma: PrismaService, @I18n() private i18n: I18nService) { }

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
            OR: {
              pageId: { contains: query || '' }
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

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Post)
  async createPost(
    @PostAccountEntity() account: Account,
    @Args('data') data: CreatePostInput
  ) {
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
    }
    const createdPost = await this.prisma.post.create(dataSave);

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
