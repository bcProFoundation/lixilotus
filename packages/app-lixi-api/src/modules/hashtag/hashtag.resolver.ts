import { Hashtag, HashtagConnection, HashtagOrder, PaginationArgs } from '@bcpros/lixi-models';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { Logger, UseFilters } from '@nestjs/common';
import { Args, Query, Resolver, Subscription } from '@nestjs/graphql';
import { SkipThrottle } from '@nestjs/throttler';
import { PubSub } from 'graphql-subscriptions';
import { I18n, I18nService } from 'nestjs-i18n';
import { connectionFromArraySlice } from 'src/common/custom-graphql-relay/arrayConnection';
import ConnectionArgs, { getPagingParameters } from 'src/common/custom-graphql-relay/connection.args';
import { GqlHttpExceptionFilter } from 'src/middlewares/gql.exception.filter';
import { HASHTAG } from '../page/constants/meili.constants';
import { MeiliService } from '../page/meili.service';
import { PrismaService } from '../prisma/prisma.service';
import _ from 'lodash';

const pubSub = new PubSub();

@SkipThrottle()
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
    const hashtag = await this.prisma.hashtag.findUnique({
      where: {
        normalizedContent: content.toLowerCase()
      }
    });

    return hashtag;
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

  @Query(() => HashtagConnection)
  async allHashtagByPage(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'id', type: () => String, nullable: true })
    id: string,
    @Args({
      name: 'orderBy',
      type: () => HashtagOrder,
      nullable: true
    })
    orderBy: HashtagOrder
  ) {
    const postsHashtag = await this.prisma.postHashtag.groupBy({
      by: ['postId'],
      where: {
        post: {
          pageId: id
        }
      }
    });

    const postsId: any = _.map(postsHashtag, 'postId');

    const result = await findManyCursorConnection(
      args =>
        this.prisma.hashtag.findMany({
          where: {
            postHashtags: {
              some: {
                postId: { in: postsId }
              }
            }
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args
        }),
      () =>
        this.prisma.hashtag.count({
          where: {
            postHashtags: {
              some: {
                postId: { in: postsId }
              }
            }
          }
        }),
      { first, last, before, after }
    );
    return result;
  }

  @Query(() => HashtagConnection)
  async allHashtagByToken(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'id', type: () => String, nullable: true })
    id: string,
    @Args({
      name: 'orderBy',
      type: () => HashtagOrder,
      nullable: true
    })
    orderBy: HashtagOrder
  ) {
    const postsHashtag = await this.prisma.postHashtag.groupBy({
      by: ['postId'],
      where: {
        post: {
          tokenId: id
        }
      }
    });

    const postsId: any = _.map(postsHashtag, 'postId');

    const result = await findManyCursorConnection(
      args =>
        this.prisma.hashtag.findMany({
          where: {
            postHashtags: {
              some: {
                postId: { in: postsId }
              }
            }
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args
        }),
      () =>
        this.prisma.hashtag.count({
          where: {
            postHashtags: {
              some: {
                postId: { in: postsId }
              }
            }
          }
        }),
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
