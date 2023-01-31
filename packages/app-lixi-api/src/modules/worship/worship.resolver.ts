import {
  WorshipedPerson,
  Worship,
  PaginationArgs,
  WorshipedPersonConnection,
  WorshipedPersonOrder,
  Account,
  CreateWorshipedPersonInput,
  CreateWorshipInput
} from '@bcpros/lixi-models';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { HttpException, HttpStatus, Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { PrismaService } from '../prisma/prisma.service';
import * as _ from 'lodash';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwtauth.guard';
import { PostAccountEntity } from 'src/decorators/postAccount.decorator';
import { I18n, I18nService } from 'nestjs-i18n';
import VError from 'verror';
import { GqlHttpExceptionFilter } from 'src/middlewares/gql.exception.filter';
import moment from 'moment';

const pubSub = new PubSub();

@Resolver(() => WorshipedPerson)
@UseFilters(GqlHttpExceptionFilter)
export class WorshipResolver {
  constructor(private logger: Logger, private prisma: PrismaService, @I18n() private i18n: I18nService) {}

  @Subscription(() => WorshipedPerson)
  worshipedPersonCreated() {
    return pubSub.asyncIterator('worshipedPersonCreated');
  }

  @Query(() => WorshipedPerson)
  async worshipedPerson(@Args('id', { type: () => String }) id: string) {
    const result = await this.prisma.worshipedPerson.findUnique({
      where: { id: id }
    });

    return result;
  }

  @Query(() => WorshipedPersonConnection)
  async allWorshipedPerson(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'query', type: () => String, nullable: true })
    query: string,
    @Args({
      name: 'orderBy',
      type: () => WorshipedPersonOrder,
      nullable: true
    })
    orderBy: WorshipedPersonOrder
  ) {
    const result = await findManyCursorConnection(
      args =>
        this.prisma.worshipedPerson.findMany({
          include: { avatar: true, country: true },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args
        }),
      () => this.prisma.post.count({}),
      { first, last, before, after }
    );
    return result;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => WorshipedPerson)
  async createWorshipedPerson(@PostAccountEntity() account: Account, @Args('data') data: CreateWorshipedPersonInput) {
    if (!account) {
      const couldNotFindAccount = await this.i18n.t('post.messages.couldNotFindAccount');
      throw new Error(couldNotFindAccount);
    }

    const { name, avatar, quote, dateOfBirth, dateOfDeath, cityId, countryId, stateId } = data;

    const uploadDetail = await this.prisma.uploadDetail.findFirst({
      where: {
        uploadId: avatar
      }
    });

    const personToSave = {
      data: {
        name: name,
        avatar: {
          connect: uploadDetail ? { id: uploadDetail.id } : undefined
        },
        quote: quote,
        dateOfBirth: moment(dateOfBirth).toString(),
        dateOfDeath: moment(dateOfDeath).toString(),
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
    const createdPerson = await this.prisma.worshipedPerson.create({
      ...personToSave
    });

    pubSub.publish('worshipedPersonCreated', { worshipedPersonCreated: createdPerson });
    return createdPerson;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => WorshipedPerson)
  async createWorship(@PostAccountEntity() account: Account, @Args('data') data: CreateWorshipInput) {
    if (!account) {
      const couldNotFindAccount = await this.i18n.t('post.messages.couldNotFindAccount');
      throw new Error(couldNotFindAccount);
    }

    const { worshipedPersonId, worshipedAmount, location, longitude, latitude } = data;

    const personToWorship = {
      data: {
        account: {
          connect: {
            id: account.id
          }
        },
        worshipedPerson: {
          connect: {
            id: worshipedPersonId
          }
        },
        worshipedAmount: worshipedAmount,
        location: location,
        latitude: latitude,
        longitude: longitude
      }
    };
    const worshipedPerson = await this.prisma.worship.create({
      ...personToWorship
    });

    pubSub.publish('personWorshiped', { personWorshiped: worshipedPerson });
    return worshipedPerson;
  }

  @ResolveField()
  async avatar(@Parent() worshipedPerson: WorshipedPerson) {
    const avatar = this.prisma.uploadDetail.findFirst({
      where: {
        worshipedPersonAvatarId: worshipedPerson.id
      },
      include: {
        upload: {
          select: {
            id: true,
            sha: true,
            bucket: true
          }
        }
      }
    });
    return avatar;
  }

  @ResolveField()
  async country(@Parent() worshipedPerson: WorshipedPerson) {
    const country = this.prisma.country.findFirst({
      where: {
        id: _.toSafeInteger(worshipedPerson.country?.id)
      }
    });
    return country;
  }

  @ResolveField()
  async state(@Parent() worshipedPerson: WorshipedPerson) {
    const state = this.prisma.state.findFirst({
      where: {
        id: _.toSafeInteger(worshipedPerson.state?.id)
      }
    });
    return state;
  }

  @ResolveField()
  async city(@Parent() worshipedPerson: WorshipedPerson) {
    const city = this.prisma.city.findFirst({
      where: {
        id: _.toSafeInteger(worshipedPerson.city?.id)
      }
    });
    return city;
  }
}
