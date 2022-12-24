import {
  Account,
  Comment,
  CommentConnection,
  CommentOrder,
  CreateCommentInput,
  PaginationArgs
} from '@bcpros/lixi-models';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { Logger, UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { I18n, I18nService } from 'nestjs-i18n';
import { PostAccountEntity } from 'src/decorators/postAccount.decorator';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwtauth.guard';
import { PrismaService } from '../prisma/prisma.service';

const pubSub = new PubSub();

@Resolver(() => Comment)
export class CommentResolver {
  private logger: Logger = new Logger(this.constructor.name);

  constructor(private prisma: PrismaService, @I18n() private i18n: I18nService) {}

  @Subscription(() => Comment)
  commentCreated() {
    return pubSub.asyncIterator('commentCreated');
  }

  @Query(() => Comment)
  async comment(@Args('id', { type: () => String }) id: string) {
    return this.prisma.comment.findUnique({
      where: { id: id }
    });
  }

  @Query(() => CommentConnection)
  async allCommentsToPostId(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'id', type: () => String, nullable: true })
    id: string,
    @Args({
      name: 'orderBy',
      type: () => CommentOrder,
      nullable: true
    })
    orderBy: CommentOrder
  ) {
    const result = await findManyCursorConnection(
      args =>
        this.prisma.comment.findMany({
          include: { commentAccount: true },
          where: {
            AND: [
              {
                commentToId: id
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
        this.prisma.comment.count({
          where: {
            AND: [
              {
                commentToId: id
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

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Comment)
  async createComment(@PostAccountEntity() account: Account, @Args('data') data: CreateCommentInput) {
    if (!account) {
      const couldNotFindAccount = await this.i18n.t('post.messages.couldNotFindAccount');
      throw new Error(couldNotFindAccount);
    }

    const { commentText, commentToId } = data;

    const commentToSave = {
      data: {
        commentText: commentText,
        commentAccount: { connect: { id: account.id } },
        commentTo: {
          connect: { id: commentToId }
        }
      }
    };
    const createdComment = await this.prisma.comment.create(commentToSave);

    pubSub.publish('commentCreated', { commentCreated: createdComment });
    return createdComment;
  }

  @ResolveField('commentAccount', () => Account)
  async postAccount(@Parent() comment: Comment) {
    const account = this.prisma.account.findFirst({
      where: {
        id: comment.commentAccountId ?? 0
      }
    });

    return account;
  }
}
