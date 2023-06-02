import {
  Page,
  PaginationArgs,
  PageOrder,
  PageConnection,
  Category,
  CreatePageInput,
  Account,
  UpdatePageInput
} from '@bcpros/lixi-models';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { HttpException, HttpStatus, Logger, UseFilters, UseGuards, Inject } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { PrismaService } from '../prisma/prisma.service';
import * as _ from 'lodash';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwtauth.guard';
import { PageAccountEntity } from 'src/decorators/pageAccount.decorator';
import { I18n, I18nService } from 'nestjs-i18n';
import VError from 'verror';
import { GqlHttpExceptionFilter } from 'src/middlewares/gql.exception.filter';
import BCHJS from '@bcpros/xpi-js';
import { aesGcmDecrypt, aesGcmEncrypt, generateRandomBase58Str, hashMnemonic } from '../../utils/encryptionMethods';

const pubSub = new PubSub();

@Resolver(() => Page)
@UseFilters(GqlHttpExceptionFilter)
export class PageResolver {
  private logger: Logger = new Logger(this.constructor.name);

  constructor(private prisma: PrismaService, @I18n() private i18n: I18nService, @Inject('xpijs') private XPI: BCHJS) {}

  @Subscription(() => Page)
  pageCreated() {
    return pubSub.asyncIterator('pageCreated');
  }

  @Query(() => Page)
  @UseGuards(GqlJwtAuthGuard)
  async page(@PageAccountEntity() account: Account, @Args('id', { type: () => String }) id: string) {
    const page = await this.prisma.page.findFirst({
      where: { id: id },
      include: {
        pageAccount: true,
        category: true,
        country: true,
        state: true
      }
    });

    // TODO: Shorten query
    const followersCount = await this.prisma.followPage.count({
      where: { pageId: id }
    });

    const result = {
      ...page,
      followersCount: followersCount,
      countryName: page?.country?.name ?? undefined,
      stateName: page?.state?.name ?? undefined
    };

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
      async args => {
        const pages = await this.prisma.page.findMany({
          include: {
            posts: true,
            category: true
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args
        });

        const output = pages
          .map(page => ({
            ...page,
            totalBurnForPage: page.posts.reduce((a, b) => a + b.lotusBurnScore, 0),
            categoryId: page.categoryId ?? 34
          }))
          .sort((a, b) => a.lotusBurnScore - b.lotusBurnScore);

        return output;
      },
      () => this.prisma.page.count(),
      { first, last, before, after }
    );
    return result;
  }

  @Query(() => PageConnection)
  async allPagesByUserId(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'id', type: () => Number, nullable: true })
    id: number,
    @Args({
      name: 'orderBy',
      type: () => PageOrder,
      nullable: true
    })
    orderBy: PageOrder
  ) {
    const result = await findManyCursorConnection(
      async args => {
        const pages = await this.prisma.page.findMany({
          where: {
            pageAccountId: id
          },
          include: {
            posts: true
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args
        });

        const output = pages.map(page => ({
          ...page,
          categoryId: page?.categoryId ?? 34,
          totalBurnForPage: page.posts.reduce((a, b) => a + b.lotusBurnScore, 0)
        }));

        return output;
      },
      () =>
        this.prisma.page.count({
          where: {
            pageAccountId: _.toSafeInteger(id)
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
      const error = new VError.WError(couldNotFindAccount);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const lang = 'english';
    const Bip39128BitMnemonic = this.XPI.Mnemonic.generate(128, this.XPI.Mnemonic.wordLists()[lang]);
    const salt = generateRandomBase58Str(10);

    const encryptedMnemonic: string = await aesGcmEncrypt(Bip39128BitMnemonic, salt + process.env.MNEMONIC_SECRET);

    const createdPage = await this.prisma.page.create({
      data: {
        ..._.omit(data, ['categoryId']),
        pageAccount: { connect: { id: account.id } },
        category: {
          connect: {
            id: Number(data.categoryId)
          }
        },
        salt: salt,
        encryptedMnemonic: encryptedMnemonic
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

  @ResolveField('pageAccount', () => Account)
  async pageAccount(@Parent() page: Page) {
    const pageAccount = this.prisma.account.findFirst({
      where: {
        id: page.pageAccountId
      }
    });

    return pageAccount;
  }

  @ResolveField('category', () => Category)
  async category(@Parent() page: Page) {
    const category = this.prisma.category.findFirst({
      where: {
        id: _.toSafeInteger(page.categoryId)
      }
    });

    return category;
  }
}
