import { AnalyticEvent } from '@bcpros/lixi-models';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Redis } from 'ioredis';
import _ from 'lodash';
import ReBloom from '../../common/redis/redis-bloom';
import { AccountDanaCacheService } from '../account/account-dana-cache.service';
import { DanaViewScoreService } from '../page/dana-view-score.service';
import { EVENTS_ANALYTIC_QUEUE, EVENT_ANALYTIC_TYPES } from './events-analytic.constants';

@Injectable()
@Processor(EVENTS_ANALYTIC_QUEUE, { concurrency: 5 })
export class EventsAnalyticProcessor extends WorkerHost {
  private logger: Logger = new Logger(this.constructor.name);
  private reBloom: ReBloom;

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly danaViewCountService: DanaViewScoreService,
    private readonly accountDanaCacheService: AccountDanaCacheService
  ) {
    super();
    this.reBloom = new ReBloom(this.redis);
  }

  public async process(job: Job<{ events: AnalyticEvent[]; accountId?: number }, boolean, string>) {
    try {
      const { events, accountId } = job.data;
      if (!accountId) {
        this.handleAnonymousEvents();
        return true;
      }
      const groups = _.groupBy(events, 'eventType');
      const groupKeys = Object.keys(groups);
      for (const groupKey of groupKeys) {
        const eventsArr = groups[groupKey];
        if (!eventsArr || eventsArr.length == 0) {
          continue;
        }

        // Process the events
        if (groupKey === EVENT_ANALYTIC_TYPES.IMPRESSION) {
          await this.processImpressionEvents(events, accountId);
        } else if (groupKey === EVENT_ANALYTIC_TYPES.CLICK) {
          await this.processViewEvents(events, accountId);
        }
      }
    } catch (error) {
      this.logger.error(error);
      return true;
    }
    return true;
  }

  private async processImpressionEvents(events: AnalyticEvent[], accountId: number) {
    const accountPostImpressionBfKey = `post-impression-exist-bf:${accountId}`;
    const accountPostImpressionBfExist = await this.redis.exists([accountPostImpressionBfKey]);
    if (!accountPostImpressionBfExist) {
      await this.reBloom.reserve(accountPostImpressionBfKey, 0.001, 1000);
    }
    const accountDana = await this.accountDanaCacheService.getAccountDana(accountId);
    const danaGiven = _.toNumber(accountDana.danaGiven);
    if (!danaGiven) return;
    const promises = [];
    const postIds = events.map(event => event.eventData.id);
    const bfExists = await this.reBloom.mexists(accountPostImpressionBfKey, ...postIds);
    let i = 0;
    for (const event of events) {
      const postId = event.eventData.id;
      if (!bfExists[i]) {
        promises.push(this.reBloom.add(accountPostImpressionBfKey, postId));
        promises.push(this.danaViewCountService.incrBy(postId, danaGiven * 0.5));
      }
      i += 1;
    }
    await Promise.allSettled(promises);
  }

  private async processViewEvents(events: AnalyticEvent[], accountId: number) {
    const accountPostViewBfKey = `post-view-exist-bf:${accountId}`;
    const accountPostViewBfExist = await this.redis.exists([accountPostViewBfKey]);
    if (!accountPostViewBfExist) {
      await this.reBloom.reserve(accountPostViewBfKey, 0.001, 1000);
    }
    const accountDana = await this.accountDanaCacheService.getAccountDana(accountId);
    const danaGiven = _.toNumber(accountDana.danaGiven);
    if (!danaGiven) return;
    const promises = [];
    const postIds = events.map(event => event.eventData.id);
    const bfExists = await this.reBloom.mexists(accountPostViewBfKey, ...postIds);
    let i = 0;
    for (const event of events) {
      const postId = event.eventData.id;
      if (!bfExists[i]) {
        promises.push(this.reBloom.add(accountPostViewBfKey, postId));
        promises.push(this.danaViewCountService.incrBy(postId, danaGiven * 0.5));
      }
      i += 1;
    }
    await Promise.allSettled(promises);
  }

  private async handleAnonymousEvents() {
    // Todo to handle anonymous events
  }
}
