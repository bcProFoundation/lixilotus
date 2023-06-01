import { Hashtag, HashtagConnection, HashtagOrder, PaginationArgs } from '@bcpros/lixi-models';
import { Logger, UseFilters } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { PrismaService } from '../prisma/prisma.service';
import { I18n, I18nService } from 'nestjs-i18n';
import { GqlHttpExceptionFilter } from 'src/middlewares/gql.exception.filter';
import { MeiliService } from '../page/meili.service';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import ConnectionArgs, { getPagingParameters } from 'src/common/custom-graphql-relay/connection.args';
import { HASHTAG } from '../page/constants/meili.constants';
import { connectionFromArraySlice } from 'src/common/custom-graphql-relay/arrayConnection';

const pubSub = new PubSub();

@Resolver(() => Hashtag)
@UseFilters(GqlHttpExceptionFilter)
export class HashtagResolver {
  private logger: Logger = new Logger(this.constructor.name);

  constructor(private prisma: PrismaService, private meiliService: MeiliService, @I18n() private i18n: I18nService) {}

  @Subscription(() => Hashtag)
  hashtagCreated() {
    return pubSub.asyncIterator('hashtagCreated');
  }

  @Query(() => Hashtag)
  async hashtag(@Args('content', { type: () => String }) content: string) {
    const hashtag: any = await this.meiliService.searchHashtag(`${process.env.MEILISEARCH_BUCKET}_${HASHTAG}`, content);

    const result = await this.prisma.hashtag.findUnique({
      where: { id: hashtag[0].id }
    });

    return result;
  }

  @Query(() => HashtagConnection)
  async allHashtag(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({
      name: 'orderBy',
      type: () => HashtagOrder,
      nullable: true
    })
    orderBy: HashtagOrder
  ) {
    const result = await findManyCursorConnection(
      args =>
        this.prisma.hashtag.findMany({
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args
        }),
      () => this.prisma.temple.count({}),
      { first, last, before, after }
    );
    return result;
  }

  @Query(() => HashtagConnection, { name: 'allHashtagBySearch' })
  async allHashtagBySearch(
    @Args() args: ConnectionArgs,
    @Args({ name: 'query', type: () => String, nullable: true })
    query: string
  ) {
    const { limit, offset } = getPagingParameters(args);

    const count = await this.meiliService.searchByQueryEstimatedTotalHits(
      `${process.env.MEILISEARCH_BUCKET}_${HASHTAG}`,
      query
    );

    const hashtags = await this.meiliService.searchByQueryHits(
      `${process.env.MEILISEARCH_BUCKET}_${HASHTAG}`,
      query,
      offset!,
      limit!
    );

    return connectionFromArraySlice(hashtags, args, {
      arrayLength: count || 0,
      sliceStart: offset || 0
    });
  }
}
