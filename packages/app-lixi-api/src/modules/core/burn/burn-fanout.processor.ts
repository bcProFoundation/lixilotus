import * as _ from 'lodash';
import { VError } from 'verror';
import moment from 'moment';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Redis } from 'ioredis';
import { I18n, I18nService } from 'nestjs-i18n';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { BURN_FANOUT_QUEUE } from './burn.constants';
import { Burn, Post } from '@bcpros/lixi-prisma';
import { FollowCacheService } from '../../account/follow-cache.service';

@Injectable()
@Processor(BURN_FANOUT_QUEUE, { concurrency: 50 })
export class BurnFanoutProcessor extends WorkerHost {
  private logger: Logger = new Logger(this.constructor.name);

  static inNetworkSourceKey = 'timeline:innetworksource';
  static outNetworkSourceKey = 'timeline:outnetworksource';

  constructor(
    private readonly followCacheService: FollowCacheService,
    @InjectRedis() private readonly redis: Redis,
    @I18n() private readonly i18n: I18nService
  ) {
    super();
  }

  public async process(job: Job<{ burn: Burn; post: Post }, boolean, string>): Promise<boolean> {
    try {
      const { burn, post } = job.data;
      const id = `${post.id}`;

      // Invalidate the cache
      const epoch = '2023-01-01 00:00:00';
      const diffHour = moment.duration(moment(burn.createdAt).diff(moment(epoch))).asHours();
      const score = burn.burnType
        ? burn.burnedValue * Math.pow(2, diffHour / 12)
        : -burn.burnedValue * Math.pow(2, diffHour / 12);

      const postAccountId = post.postAccountId;
      const pageAccountId = post?.pageId;

      // Find all the followers
      const [accountFollowers, pageFollowers] = await Promise.all([
        this.followCacheService.getAccountFollowers(postAccountId),
        pageAccountId ? this.followCacheService.getPageFollowers(pageAccountId) : Promise.resolve([])
      ]);

      const followers = _.uniq(_.compact(_.concat(accountFollowers, pageFollowers)));

      const pipeline = this.redis.pipeline();

      // Update score for outnetwork
      const keyOutnetwork = BurnFanoutProcessor.outNetworkSourceKey;
      pipeline.zincrby(keyOutnetwork, score, id);

      // Update score for innetwork
      for (const follower of followers) {
        const keyInNetwork = `${BurnFanoutProcessor.inNetworkSourceKey}:${follower}`;
        pipeline.zincrby(keyInNetwork, score, id);
      }

      await pipeline.exec();
    } catch (error) {
      this.logger.error(error);
      return false;
    }
    return true;
  }
}
