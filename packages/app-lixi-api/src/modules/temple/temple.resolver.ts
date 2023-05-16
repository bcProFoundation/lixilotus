import { Account, CreateTempleInput, PaginationArgs, Temple, TempleConnection, TempleOrder } from '@bcpros/lixi-models';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { HttpException, HttpStatus, Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { PrismaService } from '../prisma/prisma.service';
import * as _ from 'lodash';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwtauth.guard';
import { AccountEntity } from 'src/decorators/account.decorator';
import { I18n, I18nService } from 'nestjs-i18n';
import VError from 'verror';
import { GqlHttpExceptionFilter } from 'src/middlewares/gql.exception.filter';
import moment from 'moment';
import ConnectionArgs, { getPagingParameters } from '../../common/custom-graphql-relay/connection.args';
import { MeiliService } from '../page/meili.service';
import { TEMPLE } from '../page/constants/meili.constants';
import { connectionFromArraySlice } from 'src/common/custom-graphql-relay/arrayConnection';

const pubSub = new PubSub();

@Resolver(() => Temple)
@UseFilters(GqlHttpExceptionFilter)
export class TempleResolver {
  private logger: Logger = new Logger(this.constructor.name);

  constructor(private prisma: PrismaService, private meiliService: MeiliService, @I18n() private i18n: I18nService) {}

  @Subscription(() => Temple)
  templeCreated() {
    return pubSub.asyncIterator('templeCreated');
  }

  @Query(() => Temple)
  async temple(@Args('id', { type: () => String }) id: string) {
    const result = await this.prisma.temple.findUnique({
      where: { id: id },
      include: {
        account: true
      }
    });

    return result;
  }

  @Query(() => TempleConnection)
  async allTemple(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({
      name: 'orderBy',
      type: () => TempleOrder,
      nullable: true
    })
    orderBy: TempleOrder
  ) {
    const result = await findManyCursorConnection(
      args =>
        this.prisma.temple.findMany({
          include: { account: true, avatar: true, cover: true },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args
        }),
      () => this.prisma.temple.count({}),
      { first, last, before, after }
    );
    return result;
  }

  @Query(() => TempleConnection, { name: 'allTempleBySearch' })
  async allTempleBySearch(
    @Args() args: ConnectionArgs,
    @Args({ name: 'query', type: () => String, nullable: true })
    query: string
  ) {
    const { limit, offset } = getPagingParameters(args);

    const count = await this.meiliService.searchByQueryEstimatedTotalHits(
      `${process.env.MEILISEARCH_BUCKET}_${TEMPLE}`,
      query
    );

    const people = await this.meiliService.searchByQueryHits(
      `${process.env.MEILISEARCH_BUCKET}_${TEMPLE}`,
      query,
      offset!,
      limit!
    );

    return connectionFromArraySlice(people, args, {
      arrayLength: count || 0,
      sliceStart: offset || 0
    });
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Temple)
  async createTemple(@AccountEntity() account: Account, @Args('data') data: CreateTempleInput) {
    if (!account) {
      const couldNotFindAccount = await this.i18n.t('post.messages.couldNotFindAccount');
      throw new Error(couldNotFindAccount);
    }

    const {
      name,
      avatar,
      cover,
      achievement,
      description,
      alias,
      religion,
      address,
      president,
      website,
      dateOfCompleted,
      cityId,
      countryId,
      stateId
    } = data;

    const uploadDetailAvatar = await this.prisma.uploadDetail.findFirst({
      where: {
        uploadId: avatar
      }
    });

    const uploadDetailCover = await this.prisma.uploadDetail.findFirst({
      where: {
        uploadId: cover
      }
    });

    const templeToSave = {
      data: {
        name: name,
        account: { connect: { id: account.id } },
        avatar: {
          connect: uploadDetailAvatar ? { id: uploadDetailAvatar.id } : undefined
        },
        cover: {
          connect: uploadDetailCover ? { id: uploadDetailCover.id } : undefined
        },
        achievement: achievement,
        description: description,
        alias: alias,
        religion: religion,
        address: address,
        president: president,
        website: website,
        dateOfCompleted: dateOfCompleted,
        dayOfCompleted: dateOfCompleted ? new Date(dateOfCompleted).getDate() : undefined,
        monthOfCompleted: dateOfCompleted ? new Date(dateOfCompleted).getMonth() + 1 : undefined,
        yearOfCompleted: dateOfCompleted ? new Date(dateOfCompleted).getFullYear() : undefined,
        city: {
          connect: cityId
            ? {
                id: _.toSafeInteger(cityId)
              }
            : undefined
        },
        state: {
          connect: stateId
            ? {
                id: _.toSafeInteger(stateId)
              }
            : undefined
        },
        country: {
          connect: countryId
            ? {
                id: _.toSafeInteger(countryId)
              }
            : undefined
        }
      }
    };
    const createdTemple = await this.prisma.temple.create({
      ...templeToSave
    });

    const indexedTemple = {
      id: createdTemple.id,
      name: createdTemple.name,
      president: createdTemple.president,
      alias: createdTemple.alias,
      religion: createdTemple.religion,
      createdAt: createdTemple.createdAt,
      updatedAt: createdTemple.updatedAt
    };

    await this.meiliService.add(`${process.env.MEILISEARCH_BUCKET}_${TEMPLE}`, indexedTemple, indexedTemple.id);

    pubSub.publish('templeCreated', { templeCreated: createdTemple });
    return createdTemple;
  }

  @ResolveField()
  async avatar(@Parent() temple: Temple) {
    const avatar = this.prisma.uploadDetail.findFirst({
      where: {
        templeAvatarId: temple.id
      },
      include: {
        upload: {
          select: {
            id: true,
            sha: true,
            bucket: true,
            width: true,
            height: true,
            sha800: true,
            sha320: true,
            sha40: true
          }
        }
      }
    });
    return avatar;
  }

  @ResolveField()
  async cover(@Parent() temple: Temple) {
    const cover = this.prisma.uploadDetail.findFirst({
      where: {
        templeCoverId: temple.id
      },
      include: {
        upload: {
          select: {
            id: true,
            sha: true,
            bucket: true,
            width: true,
            height: true,
            sha800: true,
            sha320: true,
            sha40: true
          }
        }
      }
    });
    return cover;
  }

  @ResolveField()
  async account(@Parent() temple: Temple) {
    const account = this.prisma.account.findFirst({
      where: {
        id: _.toSafeInteger(temple.account.id)
      }
    });
    return account;
  }

  @ResolveField()
  async country(@Parent() temple: Temple) {
    const country = this.prisma.country.findFirst({
      where: {
        id: _.toSafeInteger(temple.country?.id)
      }
    });
    return country;
  }

  @ResolveField()
  async state(@Parent() temple: Temple) {
    const state = this.prisma.state.findFirst({
      where: {
        id: _.toSafeInteger(temple.state?.id)
      }
    });
    return state;
  }

  @ResolveField()
  async city(@Parent() temple: Temple) {
    const city = this.prisma.city.findFirst({
      where: {
        id: _.toSafeInteger(temple.city?.id)
      }
    });
    return city;
  }
}
