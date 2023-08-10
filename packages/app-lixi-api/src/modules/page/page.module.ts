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
import { HashtagModule } from '../hashtag/hashtag.module';
import { AccountModule } from '../account/account.module';
import { FollowCacheService } from '../account/follow-cache.service';
import { Account } from 'aws-sdk';

@Module({
  imports: [AuthModule, NotificationModule, HashtagModule, AccountModule],
  providers: [
    PageResolver,
    Logger,
    PostResolver,
    MeiliService,
    CommentResolver,
    NotificationService,
    HashtagModule,
    FollowCacheService
  ],
  exports: [MeiliService, NotificationService, FollowCacheService]
})
export class PageModule {}
