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

@Module({
  imports: [AuthModule, NotificationModule, HashtagModule],
  providers: [
    PageResolver,
    Logger,
    PostResolver,
    MeiliService,
    CommentResolver,
    NotificationService,
    NotificationGateway,
    HashtagModule
  ],
  exports: [MeiliService, NotificationService, NotificationGateway]
})
export class PageModule {}
