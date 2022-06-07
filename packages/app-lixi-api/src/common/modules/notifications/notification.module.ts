import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import IORedis from 'ioredis';
import * as _ from 'lodash';
import { AuthModule } from 'src/modules/auth/auth.module';
import { NOTIFICATION_OUTBOUND_QUEUE } from './notification.constants';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { NotificationOutboundProcessor } from './notification.processor';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: NOTIFICATION_OUTBOUND_QUEUE,
        connection: new IORedis({
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
          host: process.env.REDIS_HOST ? process.env.REDIS_HOST : 'redis-lixi',
          port: process.env.REDIS_PORT ? _.toSafeInteger(process.env.REDIS_PORT) : 6379,
        }),
      }
    ),
    AuthModule
  ],
  controllers: [NotificationController],
  providers: [NotificationGateway, NotificationService, NotificationOutboundProcessor],
  exports: [NotificationGateway, NotificationService, NotificationOutboundProcessor]
})
export class NotificationModule { }