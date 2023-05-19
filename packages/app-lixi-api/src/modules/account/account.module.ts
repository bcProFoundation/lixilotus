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
  imports: [AuthModule, NotificationModule],
  controllers: [],
  providers: [AccountResolver, FollowResolver, Logger],
  exports: []
})
export class AccountModule {}
