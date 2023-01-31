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
import { HttpException, HttpStatus, Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { PrismaService } from '../prisma/prisma.service';
import * as _ from 'lodash';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwtauth.guard';
import { PageAccountEntity } from 'src/decorators/pageAccount.decorator';
import { I18n, I18nService } from 'nestjs-i18n';
import VError from 'verror';
import { GqlHttpExceptionFilter } from 'src/middlewares/gql.exception.filter';

const pubSub = new PubSub();

@Resolver(() => Page)
@UseFilters(GqlHttpExceptionFilter)
export class PageResolver {
  constructor(private logger: Logger, private prisma: PrismaService, @I18n() private i18n: I18nService) {}

  @Subscription(() => Page)
  pageCreated() {
    return pubSub.asyncIterator('pageCreated');
  }

  @Query(() => Page)
  async page(@Args('id', { type: () => String }) id: string) {
    const result = await this.prisma.page.findUnique({
      where: { id: id }
    });

    return result;
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
      paginationArgs =>
        this.prisma.page.findMany({
          include: {
            pageAccount: true
          },
          where: {
            OR: !query
              ? undefined
              : {
                  title: { contains: query || '' },
                  name: { contains: query || '' }
                }
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...paginationArgs
        }),
      () =>
        this.prisma.page.count({
          where: {
            OR: !query
              ? undefined
              : {
                  title: { contains: query || '' },
                  name: { contains: query || '' }
                }
          }
        }),
      { first, last, before, after }
    );
    return result;
  }

  @ResolveField('avatar', () => String)
  async avatar(@Parent() page: Page) {
    const uploadDetail = await this.prisma.page
      .findUnique({
        where: {
          id: page.id
        }
      })
      .avatar({
        include: {
          upload: true
        }
      });

    if (_.isNil(uploadDetail)) return null;

    const { upload } = uploadDetail;
    const url = upload.bucket ? `${process.env.AWS_ENDPOINT}/${upload.bucket}/${upload.sha}` : upload.url;

    return url;
  }

  @ResolveField('cover', () => String)
  async cover(@Parent() page: Page) {
    const uploadDetail = await this.prisma.page
      .findUnique({
        where: {
          id: page.id
        }
      })
      .cover({
        include: {
          upload: true
        }
      });

    if (_.isNil(uploadDetail)) return null;

    const { upload } = uploadDetail;
    const url = upload.bucket ? `${process.env.AWS_ENDPOINT}/${upload.bucket}/${upload.sha}` : upload.url;

    return url;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Page)
  async createPage(@PageAccountEntity() account: Account, @Args('data') data: CreatePageInput) {
    if (!account) {
      const couldNotFindAccount = await this.i18n.t('page.messages.couldNotFindAccount');
      const error = new VError.WError(couldNotFindAccount);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const createdPage = await this.prisma.page.create({
      data: {
        ..._.omit(data, ['categoryId']),
        pageAccount: { connect: { id: account.id } },
        category: {
          connect: {
            id: Number(data.categoryId)
          }
        }
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
      throw new VError.WError(couldNotFindAccount);
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
        ..._.omit(data, ['categoryId', 'countryId', 'stateId', 'parentId', 'avatar', 'cover']),
        avatar: { connect: uploadAvatarDetail ? { id: uploadAvatarDetail.id } : undefined },
        cover: { connect: uploadCoverDetail ? { id: uploadCoverDetail.id } : undefined },
        category: {
          connect: data.categoryId
            ? {
                id: Number(data.categoryId)
              }
            : undefined
        },
        country: {
          connect: data.countryId
            ? {
                id: Number(data.countryId)
              }
            : undefined
        },
        state: {
          connect: data.stateId
            ? {
                id: Number(data.stateId)
              }
            : undefined
        }
      }
    });

    pubSub.publish('pageUpdated', { pageUpdated: updatedPage });
    return updatedPage;
  }
}
