import { Logger, Module } from '@nestjs/common';
import { TokenResolver } from './token.resolver';
import { AuthModule } from '../auth/auth.module';
import { TokenController } from '../core/token/token.controller';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import _ from 'lodash';
import { NOTIFICATION_OUTBOUND_QUEUE } from 'src/common/modules/notifications/notification.constants';
import IORedis from 'ioredis';
import { NotificationModule } from 'src/common/modules/notifications/notification.module';

@Module({
  imports: [AuthModule, NotificationModule],
  controllers: [],
  providers: [TokenResolver, Logger],
  exports: []
})
export class TokenModule {}
