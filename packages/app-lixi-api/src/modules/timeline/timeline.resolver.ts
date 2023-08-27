import {
  Account,
  Page,
  PaginationArgs,
  Post,
  PostConnection,
  Repost,
  TimelineItem,
  TimelineItemConnection,
  UploadDetail
} from '@bcpros/lixi-models';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, Logger, UseGuards, UseFilters } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { SkipThrottle } from '@nestjs/throttler';
import { PubSub } from 'graphql-subscriptions';
import { Redis } from 'ioredis';
import _ from 'lodash';
import { I18n, I18nService } from 'nestjs-i18n';
import { encode, decode } from '@msgpack/msgpack';
import { AccountEntity } from '../../decorators';
import { GqlJwtAuthGuardByPass } from '../auth/guards/gql-jwtauth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { TimelineService } from './timeline.service';
import PostLoader from '../page/post.loader';
import { GqlHttpExceptionFilter } from '../../middlewares/gql.exception.filter';

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

      const [page, reposts, uploads] = await Promise.all([
        dbPost.pageId ? this.postLoader.batchPages.load(dbPost.pageId) : Promise.resolve(null),
        this.postLoader.batchReposts.load(dbPost.id),
        this.postLoader.batchUploads.load(dbPost.id)
      ]);

      const post: Post = new Post({
        ...dbPost,
        id: dbPost.id,
        uploads: uploads ? (uploads as UploadDetail[]) : [],
        page: page ? (page as Page) : null,
        repostCount: dbPost._count.reposts,
        reposts: reposts ? (reposts as Repost[]) : []
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
    const [arrPages, arrReposts, arrUploads] = await Promise.all([
      this.postLoader.batchPages.loadMany(pageIds),
      this.postLoader.batchReposts.loadMany(uncachedPostIds),
      this.postLoader.batchUploads.loadMany(uncachedPostIds)
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
          data: new Post({ ...post })
        };
        timelineItems.push(timelineItem);
      }
    }
    await pipeline.exec();

    const result = {
      totalCount: timelineIds.totalCount,
      pageInfo: timelineIds.pageInfo,
      edges: timelineIds.edges.map((item, index) => {
        return {
          cursor: item.cursor,
          node: timelineItems[index]
        };
      })
    };
    return result;
  }
}
