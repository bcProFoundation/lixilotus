import {
  WorshipedPerson,
  Worship,
  PaginationArgs,
  WorshipedPersonConnection,
  WorshipedPersonOrder,
  Account,
  CreateWorshipedPersonInput,
  CreateWorshipInput,
  WorshipOrder,
  WorshipConnection
} from '@bcpros/lixi-models';
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
import { WorshipGateway } from './worship.gateway';
import ConnectionArgs, { getPagingParameters } from '../../common/custom-graphql-relay/connection.args';
import { MeiliService } from '../page/meili.service';
import { PERSON } from '../page/constants/meili.constants';
import { connectionFromArraySlice } from 'src/common/custom-graphql-relay/arrayConnection';

const pubSub = new PubSub();

@Resolver(() => WorshipedPerson)
@UseFilters(GqlHttpExceptionFilter)
export class WorshipResolver {
  constructor(
    private logger: Logger,
    private prisma: PrismaService,
    private meiliService: MeiliService,
    @I18n() private i18n: I18nService,
    private worshipGateway: WorshipGateway
  ) {}

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

  @Query(() => Worship)
  async worship(@Args('id', { type: () => String }) id: string) {
    const result = await this.prisma.worship.findUnique({
      where: { id: id }
    });

    return result;
  }

  @Query(() => WorshipedPersonConnection)
  async allWorshipedPerson(
    @Args() { after, before, first, last }: PaginationArgs,
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
          include: { avatar: true },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args
        }),
      () => this.prisma.worshipedPerson.count({}),
      { first, last, before, after }
    );
    return result;
  }

  @Query(() => WorshipedPersonConnection, { name: 'allWorshipedPersonBySearch' })
  async allWorshipedPersonBySearch(
    @Args() args: ConnectionArgs,
    @Args({ name: 'query', type: () => String, nullable: true })
    query: string
  ) {
    const { limit, offset } = getPagingParameters(args);

    const count = await this.meiliService.searchByQueryEstimatedTotalHits(
      `${process.env.MEILISEARCH_BUCKET}_${PERSON}`,
      query
    );

    const people = await this.meiliService.searchByQueryHits(
      `${process.env.MEILISEARCH_BUCKET}_${PERSON}`,
      query,
      offset!,
      limit!
    );

    // console.log(people);

    // const peopleId = _.map(people, 'id');

    // const searchPeople = await this.prisma.worshipedPerson.findMany({
    //   where: {
    //     id: { in: peopleId }
    //   }
    // });

    // console.log('-------------------------------------------------------------------');

    // console.log(searchPeople);

    return connectionFromArraySlice(people, args, {
      arrayLength: count || 0,
      sliceStart: offset || 0
    });
  }

  @UseGuards(GqlJwtAuthGuard)
  @Query(() => WorshipedPersonConnection)
  async allWorshipedPersonByUserId(
    @AccountEntity() account: Account,
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({
      name: 'orderBy',
      type: () => WorshipedPersonOrder,
      nullable: true
    })
    orderBy: WorshipedPersonOrder
  ) {
    if (!account) {
      const couldNotFindAccount = await this.i18n.t('post.messages.couldNotFindAccount');
      throw new Error(couldNotFindAccount);
    }

    const result = await findManyCursorConnection(
      args =>
        this.prisma.worshipedPerson.findMany({
          include: { avatar: true, country: true },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          where: {
            worship: {
              some: {
                account: {
                  id: account.id
                }
              }
            }
          },
          ...args
        }),
      () =>
        this.prisma.worshipedPerson.count({
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          where: {
            worship: {
              some: {
                account: {
                  id: account.id
                }
              }
            }
          }
        }),
      { first, last, before, after }
    );
    return result;
  }

  @Query(() => WorshipConnection)
  async allWorshipedByPersonId(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'id', type: () => String, nullable: true }) id: string,
    @Args({
      name: 'orderBy',
      type: () => WorshipOrder,
      nullable: true
    })
    orderBy: WorshipOrder
  ) {
    const result = await findManyCursorConnection(
      args =>
        this.prisma.worship.findMany({
          include: { account: true, worshipedPerson: true },
          where: {
            worshipedPerson: {
              id: id
            }
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args
        }),
      () =>
        this.prisma.worship.count({
          where: {
            worshipedPerson: {
              id: id
            }
          }
        }),
      { first, last, before, after }
    );
    return result;
  }

  @Query(() => WorshipConnection)
  async allWorship(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({
      name: 'orderBy',
      type: () => WorshipOrder,
      nullable: true
    })
    orderBy: WorshipOrder
  ) {
    const result = await findManyCursorConnection(
      args =>
        this.prisma.worship.findMany({
          include: { account: true, worshipedPerson: true },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args
        }),
      () => this.prisma.worship.count({}),
      { first, last, before, after }
    );
    return result;
  }

  @Query(() => WorshipedPersonConnection)
  async allWorshipedPersonSpecialDate(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({
      name: 'orderBy',
      type: () => WorshipedPersonOrder,
      nullable: true
    })
    orderBy: WorshipedPersonOrder
  ) {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const result = await findManyCursorConnection(
      args =>
        this.prisma.worshipedPerson.findMany({
          include: { avatar: true, country: true },
          where: {
            AND: [
              {
                dayOfDeath: day
              },
              {
                monthOfDeath: month
              }
            ]
          },
          take: 10,
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args
        }),
      () =>
        this.prisma.worshipedPerson.count({
          where: {
            AND: [
              {
                dayOfDeath: day
              },
              {
                monthOfDeath: month
              }
            ]
          },
          take: 10
        }),
      { first, last, before, after }
    );
    return result;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => WorshipedPerson)
  async createWorshipedPerson(@AccountEntity() account: Account, @Args('data') data: CreateWorshipedPersonInput) {
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
  @Mutation(() => Worship)
  async createWorship(@AccountEntity() account: Account, @Args('data') data: CreateWorshipInput) {
    if (!account) {
      const couldNotFindAccount = this.i18n.t('post.messages.couldNotFindAccount');
      throw new Error(couldNotFindAccount);
    }

    const { worshipedPersonId, worshipedAmount, location, longitude, latitude } = data;

    const person = await this.prisma.worshipedPerson.findFirst({
      where: {
        id: worshipedPersonId
      }
    });

    const newTotalAmount = person?.totalWorshipAmount ? person?.totalWorshipAmount + worshipedAmount : worshipedAmount;

    if (!person) {
      const couldNotFindPerson = this.i18n.t('worship.messages.couldNotFindPerson');
      throw new Error(couldNotFindPerson);
    }

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
        location: location || undefined,
        latitude: latitude || undefined,
        longitude: longitude || undefined
      }
    };
    const worshipedPerson = await this.prisma.worship.create({
      ...personToWorship,
      include: {
        account: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        worshipedPerson: {
          select: {
            id: true,
            name: true,
            totalWorshipAmount: true
          }
        }
      }
    });

    await this.prisma.worshipedPerson.update({
      where: {
        id: person.id
      },
      data: {
        totalWorshipAmount: newTotalAmount
      }
    });

    this.worshipGateway.publishWorship(worshipedPerson);

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
