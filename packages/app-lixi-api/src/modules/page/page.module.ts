import _ from 'lodash';
import IORedis from 'ioredis';
import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { CommentResolver } from './comment.resolver';
import { PageResolver } from './page.resolver';
import { PostResolver } from './post.resolver';
import { MeiliService } from './meili.service';
import { NotificationModule } from 'src/common/modules/notifications/notification.module';
import { NotificationService } from 'src/common/modules/notifications/notification.service';
import { BullModule } from '@nestjs/bullmq';
import { NOTIFICATION_OUTBOUND_QUEUE } from 'src/common/modules/notifications/notification.constants';
import { NotificationGateway } from 'src/common/modules/notifications/notification.gateway';

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
  providers: [
    PageResolver,
    Logger,
    PostResolver,
    MeiliService,
    CommentResolver,
    NotificationService,
    NotificationGateway
  ],
  exports: [MeiliService, NotificationService, NotificationGateway]
})
export class PageModule {}
