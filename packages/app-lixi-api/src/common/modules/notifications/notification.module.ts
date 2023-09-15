import { RedisModule } from '@liaoliaots/nestjs-redis';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';
import * as _ from 'lodash';
import { AuthModule } from 'src/modules/auth/auth.module';
import {
  CREATE_SUB_LIXIES_QUEUE,
  EXPORT_SUB_LIXIES_QUEUE,
  WITHDRAW_SUB_LIXIES_QUEUE
} from 'src/modules/core/lixi/constants/lixi.constants';
import { AccountCacheService } from '../../../modules/account/account-cache.service';
import { BURN_FANOUT_QUEUE } from '../../../modules/core/burn/burn.constants';
import { EVENTS_ANALYTIC_QUEUE } from '../../../modules/events-analytic/events-analytic.constants';
import { NOTIFICATION_OUTBOUND_QUEUE, WEBPUSH_NOTIFICATION_QUEUE } from './notification.constants';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { NotificationOutboundProcessor } from './notification.processor';
import { NotificationService } from './notification.service';
import { WebpushNotificationProcessor } from './webpush-notification.process';
import { WebpushController } from './webpush.controller';
import { EventsAnalyticModule } from '../../../modules/events-analytic/events-analytic.module';
import { EventsAnalyticProcessor } from '../../../modules/events-analytic/events-analytic.processor';

@Module({
  imports: [
    BullModule.registerQueueAsync(
      {
        name: NOTIFICATION_OUTBOUND_QUEUE,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          return {
            prefix: 'lixilotus',
            name: NOTIFICATION_OUTBOUND_QUEUE,
            connection: new IORedis({
              maxRetriesPerRequest: null,
              enableReadyCheck: false,
              host: config.get<string>('REDIS_HOST') ? config.get<string>('REDIS_HOST') : 'redis-lixi',
              port: config.get<string>('REDIS_PORT') ? _.toSafeInteger(config.get<string>('REDIS_PORT')) : 6379
            })
          };
        }
      },
      {
        name: WEBPUSH_NOTIFICATION_QUEUE,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          return {
            prefix: 'lixilotus',
            name: WEBPUSH_NOTIFICATION_QUEUE,
            connection: new IORedis({
              maxRetriesPerRequest: null,
              enableReadyCheck: false,
              host: config.get<string>('REDIS_HOST') ? config.get<string>('REDIS_HOST') : 'redis-lixi',
              port: config.get<string>('REDIS_PORT') ? _.toSafeInteger(config.get<string>('REDIS_PORT')) : 6379
            })
          };
        }
      },
      {
        name: CREATE_SUB_LIXIES_QUEUE,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          return {
            prefix: 'lixilotus:lixi',
            name: CREATE_SUB_LIXIES_QUEUE,
            connection: new IORedis({
              maxRetriesPerRequest: null,
              enableReadyCheck: false,
              host: config.get<string>('REDIS_HOST') ? config.get<string>('REDIS_HOST') : 'redis-lixi',
              port: config.get<string>('REDIS_PORT') ? _.toSafeInteger(config.get<string>('REDIS_PORT')) : 6379
            })
          };
        }
      },
      {
        name: EXPORT_SUB_LIXIES_QUEUE,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          return {
            prefix: 'lixilotus:lixi',
            name: EXPORT_SUB_LIXIES_QUEUE,
            connection: new IORedis({
              maxRetriesPerRequest: null,
              enableReadyCheck: false,
              host: config.get<string>('REDIS_HOST') ? config.get<string>('REDIS_HOST') : 'redis-lixi',
              port: config.get<string>('REDIS_PORT') ? _.toSafeInteger(config.get<string>('REDIS_PORT')) : 6379
            })
          };
        }
      },
      {
        name: WITHDRAW_SUB_LIXIES_QUEUE,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          return {
            prefix: 'lixilotus:lixi',
            name: WITHDRAW_SUB_LIXIES_QUEUE,
            connection: new IORedis({
              maxRetriesPerRequest: null,
              enableReadyCheck: false,
              host: config.get<string>('REDIS_HOST') ? config.get<string>('REDIS_HOST') : 'redis-lixi',
              port: config.get<string>('REDIS_PORT') ? _.toSafeInteger(config.get<string>('REDIS_PORT')) : 6379
            })
          };
        }
      },
      {
        name: BURN_FANOUT_QUEUE,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          return {
            prefix: 'lixilotus:lixi',
            name: BURN_FANOUT_QUEUE,
            connection: new IORedis({
              maxRetriesPerRequest: null,
              enableReadyCheck: false,
              host: config.get<string>('REDIS_HOST') ? config.get<string>('REDIS_HOST') : 'redis-lixi',
              port: config.get<string>('REDIS_PORT') ? _.toSafeInteger(config.get<string>('REDIS_PORT')) : 6379
            })
          };
        }
      },
      {
        name: EVENTS_ANALYTIC_QUEUE,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          return {
            prefix: 'lixilotus',
            name: EVENTS_ANALYTIC_QUEUE,
            connection: new IORedis({
              maxRetriesPerRequest: null,
              enableReadyCheck: false,
              host: config.get<string>('REDIS_HOST') ? config.get<string>('REDIS_HOST') : 'redis-lixi',
              port: config.get<string>('REDIS_PORT') ? _.toSafeInteger(config.get<string>('REDIS_PORT')) : 6379
            })
          };
        }
      }
    ),
    AuthModule,
    RedisModule
  ],
  controllers: [NotificationController, WebpushController],
  providers: [
    NotificationGateway,
    NotificationService,
    NotificationOutboundProcessor,
    WebpushNotificationProcessor,
    AccountCacheService
  ],
  exports: [
    NotificationGateway,
    NotificationService,
    NotificationOutboundProcessor,
    WebpushNotificationProcessor,
    BullModule
  ]
})
export class NotificationModule {}
