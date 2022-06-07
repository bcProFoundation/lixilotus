import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import IORedis from 'ioredis';
import * as _ from 'lodash';
import { join } from 'path';
import { NotificationModule } from 'src/common/modules/notifications/notification.module';
import { AuthModule } from '../auth/auth.module';
import { LixiNftModule } from '../nft/lixinft.module';
import { AccountController } from './account/account.controller';
import { ClaimController } from './claim/claim.controller';
import { EnvelopeController } from './envelope/envelope.controller';
import { HeathController } from './healthcheck/heathcheck.controller';
import {
  CREATE_SUB_LIXIES_QUEUE,
  EXPORT_SUB_LIXIES_QUEUE,
  WITHDRAW_SUB_LIXIES_QUEUE
} from './lixi/constants/lixi.constants';
import { LixiController } from './lixi/lixi.controller';
import { LixiService } from './lixi/lixi.service';
import { CreateSubLixiesEventsListener } from './lixi/processors/create-sub-lixies.eventslistener';
import { CreateSubLixiesProcessor } from './lixi/processors/create-sub-lixies.processor';
import { ExportSubLixiesEventsListener } from './lixi/processors/export-sub-lixies.eventslistener';
import { ExportSubLixiesProcessor } from './lixi/processors/export-sub-lixies.processor';
import { WithdrawSubLixiesEventsListener } from './lixi/processors/withdraw-sub-lixies.eventslistener';
import { WithdrawSubLixiesProcessor } from './lixi/processors/withdraw-sub-lixies.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: CREATE_SUB_LIXIES_QUEUE,
        connection: new IORedis({
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
          host: process.env.REDIS_HOST ? process.env.REDIS_HOST : 'redis-lixi',
          port: process.env.REDIS_PORT ? _.toSafeInteger(process.env.REDIS_PORT) : 6379,
        }),
        processors: [
          {
            path: join(__dirname, 'lixi/processors/create-sub-lixies.isolated.processor'),
            concurrency: 3,
          },
        ],
      },
      {
        name: EXPORT_SUB_LIXIES_QUEUE,
        connection: new IORedis({
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
          host: process.env.REDIS_HOST ? process.env.REDIS_HOST : 'redis-lixi',
          port: process.env.REDIS_PORT ? _.toSafeInteger(process.env.REDIS_PORT) : 6379,
        }),
      },
      {
        name: WITHDRAW_SUB_LIXIES_QUEUE,
        connection: new IORedis({
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
          host: process.env.REDIS_HOST ? process.env.REDIS_HOST : 'redis-lixi',
          port: process.env.REDIS_PORT ? _.toSafeInteger(process.env.REDIS_PORT) : 6379,
        }),
      },
    ),
    AuthModule,
    NotificationModule,
    LixiNftModule
  ],
  controllers: [
    AccountController,
    LixiController,
    ClaimController,
    EnvelopeController,
    HeathController
  ],
  providers: [
    LixiService,
    CreateSubLixiesProcessor,
    CreateSubLixiesEventsListener,
    WithdrawSubLixiesProcessor,
    ExportSubLixiesProcessor,
    ExportSubLixiesEventsListener,
    WithdrawSubLixiesEventsListener,
  ],
  exports: [
    LixiService,
    CreateSubLixiesProcessor,
    CreateSubLixiesEventsListener,
    WithdrawSubLixiesProcessor,
    ExportSubLixiesProcessor,
    ExportSubLixiesEventsListener,
    WithdrawSubLixiesEventsListener,
  ]
})
export class CoreModule { }
