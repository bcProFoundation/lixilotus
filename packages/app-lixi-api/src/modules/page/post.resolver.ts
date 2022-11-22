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
    console.log(query);
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

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Post)
  async createPost(@PostAccountEntity() account: Account, @Args('data') data: CreatePostInput) {
    if (!account) {
      const couldNotFindAccount = await this.i18n.t('post.messages.couldNotFindAccount');
      throw new Error(couldNotFindAccount);
    }

    const { uploadCovers, pageId, content } = data;

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

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Post)
  async updatePost(@PostAccountEntity() account: Account, @Args('data') data: UpdatePostInput) {
    // if (!account) {
    //   const couldNotFindAccount = await this.i18n.t('post.messages.couldNotFindAccount');
    //   throw new Error(couldNotFindAccount);
    // }
    // const uploadCoverDetail = data.cover
    //   ? await this.prisma.uploadDetail.findFirst({
    //     where: {
    //       uploadId: data.cover
    //     }
    //   })
    //   : undefined;
    // const updatedPost = await this.prisma.post.update({
    //   where: {
    //     id: data.id
    //   },
    //   data: {
    //     ...data,
    //     uploadedCovers: { connect: uploadCoverDetail ? { id: uploadCoverDetail.id } : undefined }
    //   }
    // });
    // pubSub.publish('postUpdated', { postUpdated: updatedPost });
    // return updatedPost;
  }
}
