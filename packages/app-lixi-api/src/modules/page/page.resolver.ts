import {
  Page,
  PaginationArgs,
  PageOrder,
  PageConnection,
  CreatePageInput,
  Account,
  UpdatePageInput
} from '@bcpros/lixi-models';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { ExecutionContext, Logger, Request, UseGuards } from '@nestjs/common';
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
import { PrismaService } from '../prisma/prisma.service';
import * as _ from 'lodash';
import { GqlJwtAuthGuard } from '../auth/gql-jwtauth.guard';
import { PageAccountEntity } from 'src/decorators/pageAccount.decorator';
import { I18n, I18nService } from 'nestjs-i18n';

const pubSub = new PubSub();

@Resolver(() => Page)
export class PageResolver {
  private logger: Logger = new Logger(this.constructor.name);

  constructor(private prisma: PrismaService, @I18n() private i18n: I18nService) {}

  @Subscription(() => Page)
  pageCreated() {
    return pubSub.asyncIterator('pageCreated');
  }

  @Query(() => Page)
  async page(@Args('id', { type: () => String }) id: string) {
    return this.prisma.page.findUnique({
      where: { id: id },
      include: {
        parent: true
      }
    });
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

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Page)
  async createPage(@PageAccountEntity() account: Account, @Args('data') data: CreatePageInput) {
    if (!account) {
      const couldNotFindAccount = await this.i18n.t('page.messages.couldNotFindAccount');
      throw new Error(couldNotFindAccount);
    }

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

    pubSub.publish('pageCreated', { pageCreated: createdPage });
    return createdPage;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Page)
  async updatePage(@PageAccountEntity() account: Account, @Args('data') data: UpdatePageInput) {
    if (!account) {
      const couldNotFindAccount = await this.i18n.t('page.messages.couldNotFindAccount');
      throw new Error(couldNotFindAccount);
    }

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

    const updatedPage = await this.prisma.page.update({
      where: {
        id: data.id
      },
      data: {
        ...data,
        avatar: { connect: uploadAvatarDetail ? { id: uploadAvatarDetail.id } : undefined },
        cover: { connect: uploadCoverDetail ? { id: uploadCoverDetail.id } : undefined }
      }
    });

    pubSub.publish('pageUpdated', { pageUpdated: updatedPage });
    return updatedPage;
  }
}
