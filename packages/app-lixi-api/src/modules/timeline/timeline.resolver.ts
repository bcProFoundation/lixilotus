import {
  Account,
  Page,
  PaginationArgs,
  Post,
  Repost,
  TimelineItem,
  TimelineItemConnection,
  UploadDetail
} from '@bcpros/lixi-models';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { decode, encode } from '@msgpack/msgpack';
import { Injectable, Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { SkipThrottle } from '@nestjs/throttler';
import { PubSub } from 'graphql-subscriptions';
import { Redis } from 'ioredis';
import _ from 'lodash';
import { I18n, I18nService } from 'nestjs-i18n';
import { AccountEntity, PostAccountEntity } from '../../decorators';
import { GqlHttpExceptionFilter } from '../../middlewares/gql.exception.filter';
import { GqlJwtAuthGuardByPass } from '../auth/guards/gql-jwtauth.guard';
import PostLoader from '../page/post.loader';
import { PrismaService } from '../prisma/prisma.service';
import { TimelineService } from './timeline.service';

const pubSub = new PubSub();

@Injectable()
@Resolver(() => TimelineItem)
@SkipThrottle()
@UseFilters(GqlHttpExceptionFilter)
export class TimelineResolver {
  private logger: Logger = new Logger(this.constructor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly postLoader: PostLoader,
    private readonly timelineService: TimelineService,
    @InjectRedis() private readonly redis: Redis,
    @I18n() private readonly i18n: I18nService
  ) {}

  @SkipThrottle()
  @Query(returns => TimelineItem)
  @UseGuards(GqlJwtAuthGuardByPass)
  async timeline(@Args('id', { type: () => String }) id: string) {
    const postId = id;
    if (!postId) throw new Error('Invalid argument');

    const hashPrefix = `posts:item-data`;
    const buffers = await this.redis.hmgetBuffer(hashPrefix, postId);
    if (!buffers[0]) {
      // cache miss
      const dbPost = await this.prisma.post.findUnique({
        where: { id: id },
        include: {
          uploads: true,
          token: true,
          _count: {
            select: { reposts: true, comments: true }
          },
          postAccount: true,
          translations: true
        }
      });

      if (!dbPost) return null;

      const [page, reposts, uploads, danaViewScore] = await Promise.all([
        dbPost.pageId ? this.postLoader.batchPages.load(dbPost.pageId) : Promise.resolve(null),
        this.postLoader.batchReposts.load(dbPost.id),
        this.postLoader.batchUploads.load(dbPost.id),
        this.postLoader.batchDanaViewScores.load(dbPost.id)
      ]);

      const post: Post = new Post({
        ...dbPost,
        id: dbPost.id,
        uploads: uploads ? (uploads as UploadDetail[]) : [],
        page: page ? (page as Page) : null,
        repostCount: dbPost._count.reposts,
        reposts: reposts ? (reposts as Repost[]) : [],
        danaBurnScore: (danaViewScore as number) || 0
      });

      const timelineItem: TimelineItem = {
        id: `${dbPost.id}`,
        data: post
      };
      const buffer = encode(post);
      this.redis.hset(hashPrefix, timelineItem.id, Buffer.from(buffer));

      return timelineItem;
    } else {
      const data = decode(buffers[0]) as Post;
      const timelineItem: TimelineItem = {
        id: `${data.id}`,
        data
      };
      return timelineItem;
    }
  }

  @SkipThrottle()
  @Query(returns => TimelineItemConnection)
  @UseGuards(GqlJwtAuthGuardByPass)
  async homeTimeline(
    @AccountEntity() account: Account,
    @Args() { after, first }: PaginationArgs,
    @Args({ name: 'level', type: () => Number, nullable: true }) level: number
  ) {
    const accountId = account ? account.id : undefined;
    const timelineIds = await this.timelineService.getTimelineIdsByLevel(level, accountId, first, after);

    const ids = timelineIds
      ? timelineIds.edges.map(item => {
          return item.cursor;
        })
      : [];

    if (_.isEmpty(ids)) {
      return {
        totalCount: 0,
        pageInfo: timelineIds.pageInfo,
        edges: []
      };
    }

    const hashPrefix = `posts:item-data`;
    let buffers;
    try {
      buffers = await this.redis.hmgetBuffer(hashPrefix, ...ids);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }

    const uncachedPostIds = [];
    for (let i = 0; i < ids.length; i++) {
      if (!buffers[i]) {
        uncachedPostIds.push(ids[i]);
      }
    }

    const uncachedPosts = await this.prisma.post.findMany({
      include: {
        postAccount: true,
        translations: true,
        uploads: true,
        token: true,
        _count: {
          select: { reposts: true, comments: true }
        }
      },
      where: {
        id: { in: uncachedPostIds }
      }
    });
    const pageIds: string[] = _.compact(uncachedPosts.map(post => post.pageId)) ?? [];

    const timelineItems: TimelineItem[] = [];
    const [arrPages, arrReposts, arrUploads, arrDanaViewScore] = await Promise.all([
      this.postLoader.batchPages.loadMany(pageIds),
      this.postLoader.batchReposts.loadMany(uncachedPostIds),
      this.postLoader.batchUploads.loadMany(uncachedPostIds),
      this.postLoader.batchDanaViewScores.loadMany(ids)
    ]);

    const pipeline = this.redis.pipeline();
    for (let i = 0; i < ids.length; i++) {
      if (!buffers[i]) {
        const dbPost = uncachedPosts.find(item => {
          return item.id === ids[i];
        });
        if (dbPost) {
          const page = arrPages.find(item => {
            if (item instanceof Error) return false;
            return item.id == dbPost.pageId;
          });

          const post: Post = new Post({
            ...dbPost,
            id: dbPost.id,
            uploads: arrUploads[i] ? (arrUploads[i] as UploadDetail[]) : [],
            danaViewScore: (arrDanaViewScore[i] ?? 0) as number,
            page: page ? (page as Page) : null,
            repostCount: dbPost._count.reposts,
            reposts: arrReposts[i] ? (arrReposts[i] as Repost[]) : []
          });

          const buffer = encode(post);
          buffers[i] = Buffer.from(buffer);
          const timelineItem: TimelineItem = {
            id: `${dbPost.id}`,
            data: post
          };
          timelineItems.push(timelineItem);
          pipeline.hset(hashPrefix, timelineItem.id, buffers[i]!);
        }
      } else {
        const post = decode(buffers[i]) as Post;
        const timelineItem: TimelineItem = {
          id: `${post.id}`,
          data: new Post({
            ...post,
            danaViewScore: (arrDanaViewScore[i] ?? 0) as number
          })
        };
        timelineItems.push(timelineItem);
      }
    }
    await pipeline.exec();

    const edges = timelineItems.map((item, index) => {
      return {
        cursor: item.id,
        node: timelineItems[index]
      };
    });

    // Calculate follow fields
    if (accountId) {
      const pageIds = edges.map(edge => edge.node.data?.pageId || '');
      const postAccountIds = edges.map(edge => edge.node.data?.postAccountId || 0);
      const tokenIds = edges.map(edge => edge.node.data?.tokenId || '');

      const [arrFollowPostOwner, arrFollowedPage, arrFollowedToken] = await Promise.all([
        this.postLoader.batchCheckAccountFollowAllAccount.loadMany(
          postAccountIds.map((postAccountId: number) => {
            return {
              followingAccountId: postAccountId,
              accountId
            };
          })
        ),
        this.postLoader.batchCheckAccountFollowAllPage.loadMany(
          pageIds.map((pageId: string) => {
            return {
              pageId,
              accountId
            };
          })
        ),
        this.postLoader.batchCheckAccountFollowAllToken.loadMany(
          tokenIds.map((tokenId: string) => {
            return {
              tokenId,
              accountId
            };
          })
        )
      ]);
      // Map back to edges
      let i = 0;
      for (const edge of edges) {
        const followPostOwner = arrFollowPostOwner[i] instanceof Error ? false : arrFollowPostOwner[i];
        const followPage = arrFollowedPage[i] instanceof Error ? false : arrFollowedPage[i];
        const followToken = arrFollowedToken[i] instanceof Error ? false : arrFollowedToken[i];

        if (!_.isNil(edge.node?.data)) {
          edge.node.data!.followPostOwner = followPostOwner as boolean;
          edge.node.data!.followedPage = followPage as boolean;
          edge.node.data!.followedToken = followToken as boolean;
        }
        i++;
      }
    } else {
      edges.map(edge => {
        if (!_.isNil(edge.node?.data)) {
          edge.node.data!.followPostOwner = false;
          edge.node.data!.followedPage = false;
          edge.node.data!.followedToken = false;
        }
      });
    }

    const firstEdge = edges[0];
    const lastEdge = edges[edges.length - 1];
    const lastTimelineIdCursor = timelineIds.edges[timelineIds.edges.length - 1].cursor;
    const result = {
      totalCount: timelineIds.totalCount,
      pageInfo: {
        startCursor: firstEdge ? firstEdge.cursor : undefined,
        endCursor: lastEdge ? lastEdge.cursor : undefined,
        hasPreviousPage: true,
        hasNextPage: lastEdge.cursor === lastTimelineIdCursor
      },
      edges
    };
    return result;
  }
}
