import { Page, PaginationArgs, PageOrder, PageConnection, CreatePageInput } from '@bcpros/lixi-models';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { ExecutionContext, Request, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  GqlExecutionContext,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Subscription
} from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { FastifyRequest } from 'fastify';
import { PrismaService } from '../prisma/prisma.service';
import * as _ from 'lodash';
import { GqlJwtAuthGuard } from '../auth/gql-jwtauth.guard';

const pubSub = new PubSub();

@Resolver(() => Page)
export class PageResolver {
  constructor(private prisma: PrismaService) {}

  @Subscription(() => Page)
  pageCreated() {
    return pubSub.asyncIterator('pageCreated');
  }

  @Query(() => Page)
  async page(@Args('id', { type: () => String }) id: string) {
    return this.prisma.page.findUnique({ where: { id: id } });
  }

  @Query(() => PageConnection)
  async allPages(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'query', type: () => String, nullable: true })
    query: string,
    @Args({
      name: 'orderBy',
      type: () => PageOrder,
      nullable: true
    })
    orderBy: PageOrder
  ) {
    const result = await findManyCursorConnection(
      args =>
        this.prisma.page.findMany({
          include: { pageAccount: true },
          where: {
            OR: {
              title: { contains: query || '' },
              name: { contains: query || '' }
            }
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args
        }),
      () =>
        this.prisma.page.count({
          where: {
            OR: {
              title: { contains: query || '' },
              name: { contains: query || '' }
            }
          }
        }),
      { first, last, before, after }
    );
    return result;
  }

  // @ResolveField('author', () => User)
  // async author(@Parent() post: Post) {
  //   return this.prisma.post.findUnique({ where: { id: post.id } }).author();
  // }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Page)
  async createPage(@Context() context: ExecutionContext, @Args('data') data: CreatePageInput) {
    const req = (context as any).req;
    const account = (req as any).account;

    const uploadAvatarDetail = data.avatar
      ? await this.prisma.uploadDetail.findFirst({
          where: {
            uploadId: data.avatar
          }
        })
      : undefined;

    const uploadCoverDetail = data.cover
      ? await this.prisma.uploadDetail.findFirst({
          where: {
            uploadId: data.cover
          }
        })
      : undefined;

    const createdPage = await this.prisma.page.create({
      data: {
        ..._.omit(data, ['avatar', 'cover']),
        pageAccount: { connect: { id: account.id } },
        avatar: { connect: uploadAvatarDetail ? { id: uploadAvatarDetail.id } : undefined },
        cover: { connect: uploadCoverDetail ? { id: uploadCoverDetail.id } : undefined },
        parentId: undefined
      }
    });

    pubSub.publish('postCreated', { postCreated: createdPage });
    return createdPage;
  }
}
