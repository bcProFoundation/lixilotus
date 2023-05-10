import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';
import * as _ from 'lodash';
import { AuthModule } from 'src/modules/auth/auth.module';
import { NOTIFICATION_OUTBOUND_QUEUE, WEBPUSH_NOTIFICATION_QUEUE } from './notification.constants';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { NotificationOutboundProcessor } from './notification.processor';
import { NotificationService } from './notification.service';
import { WebpushNotificationProcessor } from './webpush-notification.process';
import { WebpushController } from './webpush.controller';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: NOTIFICATION_OUTBOUND_QUEUE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          name: NOTIFICATION_OUTBOUND_QUEUE,
          connection: new IORedis({
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            host: config.get<string>('REDIS_HOST') ? config.get<string>('REDIS_HOST') : 'redis-lixi',
            port: config.get<string>('REDIS_PORT') ? _.toSafeInteger(config.get<string>('REDIS_PORT')) : 6379
          })
        };
      }
    }),
    BullModule.registerQueueAsync({
      name: WEBPUSH_NOTIFICATION_QUEUE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          name: WEBPUSH_NOTIFICATION_QUEUE,
          connection: new IORedis({
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            host: config.get<string>('REDIS_HOST') ? config.get<string>('REDIS_HOST') : 'redis-lixi',
            port: config.get<string>('REDIS_PORT') ? _.toSafeInteger(config.get<string>('REDIS_PORT')) : 6379
          })
        };
      }
    }),
    AuthModule
  ],
  controllers: [NotificationController],
  providers: [
    NotificationGateway,
    NotificationService,
    NotificationOutboundProcessor,
    WebpushController,
    WebpushNotificationProcessor
  ],
  exports: [NotificationGateway, NotificationService, NotificationOutboundProcessor]
})
export class NotificationModule {}
