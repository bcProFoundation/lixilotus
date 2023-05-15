import { Logger, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AccountController } from '../core/account/account.controller';
import { AccountResolver } from './account.resolver';
import { FollowResolver } from './follow.resolver';
import { BullModule } from '@nestjs/bullmq';
import _ from 'lodash';
import { NOTIFICATION_OUTBOUND_QUEUE } from 'src/common/modules/notifications/notification.constants';
import { NotificationModule } from 'src/common/modules/notifications/notification.module';
import IORedis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { NotificationGateway } from 'src/common/modules/notifications/notification.gateway';
import { NotificationService } from 'src/common/modules/notifications/notification.service';

@Module({
  imports: [
    AuthModule,
    NotificationModule,
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
    })
  ],
  controllers: [],
  providers: [AccountResolver, FollowResolver, Logger, NotificationService, NotificationGateway],
  exports: [NotificationService, NotificationGateway]
})
export class AccountModule {}
