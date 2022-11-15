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
import { Args, Mutation, Query, Resolver, Subscription, ResolveField, Parent } from '@nestjs/graphql';
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
          include: { postAccount: true, uploadedCovers: true },
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

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Post)
  async createPost(@PostAccountEntity() account: Account, @Args('data') data: CreatePostInput) {
    if (!account) {
      const couldNotFindAccount = await this.i18n.t('post.messages.couldNotFindAccount');
      throw new Error(couldNotFindAccount);
    }

    const { uploadCovers, pageId, content } = data;
    let uploadDetailIds: any = [];

    if (pageId) {
    }

    if (uploadCovers.length > 0) {
      const promises = uploadCovers.map(async upload => {
        const uploadDetail = await this.prisma.uploadDetail.findFirst({
          where: {
            uploadId: upload
          }
        });

        return uploadDetail;
      });

      uploadDetailIds = await Promise.all(promises);
    }

    const postToSave = {
      data: {
        content: content,
        postAccount: { connect: { id: account.id } },
        uploadedCovers: {
          connect: uploadDetailIds.map((uploadDetail: any) => {
            return {
              id: uploadDetail.id
            };
          })
        }
      }
    };
    const createdPost = await this.prisma.post.create(postToSave);

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

  // @UseGuards(GqlJwtAuthGuard)
  // @Mutation(() => Post)
  // async updatePost(@PostAccountEntity() account: Account, @Args('data') data: UpdatePostInput) {
  //   if (!account) {
  //     const couldNotFindAccount = await this.i18n.t('post.messages.couldNotFindAccount');
  //     throw new Error(couldNotFindAccount);
  //   }

  //   const uploadCoverDetail = data.cover
  //     ? await this.prisma.uploadDetail.findFirst({
  //       where: {
  //         uploadId: data.cover
  //       }
  //     })
  //     : undefined;

  //   const updatedPost = await this.prisma.post.update({
  //     where: {
  //       id: data.id
  //     },
  //     data: {
  //       ...data,
  //       uploadedCovers: { connect: uploadCoverDetail ? { id: uploadCoverDetail.id } : undefined }
  //     }
  //   });

  //   pubSub.publish('postUpdated', { postUpdated: updatedPost });
  //   return updatedPost;
  // }
}
