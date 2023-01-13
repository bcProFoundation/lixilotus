import {
  Account,
  Comment,
  CommentConnection,
  CommentOrder,
  CreateCommentInput,
  PaginationArgs
} from '@bcpros/lixi-models';
import BCHJS from '@bcpros/xpi-js';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { HttpException, HttpStatus, Inject, Logger, UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { ChronikClient } from 'chronik-client';
import { PubSub } from 'graphql-subscriptions';
import _ from 'lodash';
import { I18n, I18nService } from 'nestjs-i18n';
import { InjectChronikClient } from 'src/common/modules/chronik/chronik.decorators';
import { PostAccountEntity } from 'src/decorators/postAccount.decorator';
import VError from 'verror';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwtauth.guard';
import { PrismaService } from '../prisma/prisma.service';

const pubSub = new PubSub();

@Resolver(() => Comment)
export class CommentResolver {
  private logger: Logger = new Logger(this.constructor.name);

  constructor(
    private prisma: PrismaService,
    @I18n() private i18n: I18nService,
    @InjectChronikClient('xpi') private chronik: ChronikClient,
    @Inject('xpijs') private XPI: BCHJS
  ) {}

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
    try {
      if (!account) {
        const couldNotFindAccount = await this.i18n.t('post.messages.couldNotFindAccount');
        throw new Error(couldNotFindAccount);
      }

      const { commentText, commentToId, tipHex } = data;

      const commentToSave = {
        data: {
          commentText: commentText,
          commentAccount: { connect: { id: account.id } },
          commentTo: {
            connect: { id: commentToId }
          }
        }
      };

      const savedComment = await this.prisma.$transaction(async prisma => {
        const createdComment = await prisma.comment.create(commentToSave);

        if (tipHex) {
          const post = await prisma.post.findFirst({
            where: {
              id: commentToId
            },
            include: {
              postAccount: true
            }
          });

          const txData = await this.XPI.RawTransactions.decodeRawTransaction(tipHex);
          const { value } = txData['vout'][0];
          if (Number(value) < 0) {
            throw new Error('Syntax error. Number cannot be less than or equal to 0');
          }

          const broadcastResponse = await this.chronik.broadcastTx(tipHex);
          const { txid } = broadcastResponse;
          const transactionTip = {
            txid,
            fromAddress: account.address,
            fromAccountId: account.name,
            toAddress: post?.postAccount.address as string,
            toAccountId: post?.postAccount.name as string,
            tipValue: value,
            commentId: createdComment.id
          };

          await prisma.giveTip.create({ data: transactionTip });
        }
        return createdComment;
      });

      pubSub.publish('commentCreated', { commentCreated: savedComment });
      return savedComment;
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
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
