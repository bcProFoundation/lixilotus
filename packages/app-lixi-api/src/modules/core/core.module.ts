import { BullModule } from '@nestjs/bullmq';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import IORedis from 'ioredis';
import * as _ from 'lodash';
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
import { CountryController } from './country/country.controller';
import { LixiService } from './lixi/lixi.service';
import { UploadFilesController } from './upload/upload.controller';
import { CreateSubLixiesEventsListener } from './lixi/processors/create-sub-lixies.eventslistener';
import { CreateSubLixiesProcessor } from './lixi/processors/create-sub-lixies.processor';
import { ExportSubLixiesEventsListener } from './lixi/processors/export-sub-lixies.eventslistener';
import { ExportSubLixiesProcessor } from './lixi/processors/export-sub-lixies.processor';
import { WithdrawSubLixiesEventsListener } from './lixi/processors/withdraw-sub-lixies.eventslistener';
import { WithdrawSubLixiesProcessor } from './lixi/processors/withdraw-sub-lixies.processor';

import { ConfigService } from '@nestjs/config';
import cors from 'cors';
const baseCorsConfig = cors({
  origin: process.env.BASE_URL ?? ''
});

@Module({
  imports: [
    BullModule.registerQueueAsync(
      {
        name: CREATE_SUB_LIXIES_QUEUE,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          return {
            name: CREATE_SUB_LIXIES_QUEUE,
            connection: new IORedis({
              maxRetriesPerRequest: null,
              enableReadyCheck: false,
              host: config.get<string>('REDIS_HOST') ? config.get<string>('REDIS_HOST') : 'redis-lixi',
              port: config.get<string>('REDIS_PORT') ? _.toSafeInteger(config.get<string>('REDIS_PORT')) : 6379,
            })
          }
        }
      },
      {
        name: EXPORT_SUB_LIXIES_QUEUE,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          return {
            name: EXPORT_SUB_LIXIES_QUEUE,
            connection: new IORedis({
              maxRetriesPerRequest: null,
              enableReadyCheck: false,
              host: config.get<string>('REDIS_HOST') ? config.get<string>('REDIS_HOST') : 'redis-lixi',
              port: config.get<string>('REDIS_PORT') ? _.toSafeInteger(config.get<string>('REDIS_PORT')) : 6379,
            })
          }
        }
      },
      {
        name: WITHDRAW_SUB_LIXIES_QUEUE,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          return {
            name: WITHDRAW_SUB_LIXIES_QUEUE,
            connection: new IORedis({
              maxRetriesPerRequest: null,
              enableReadyCheck: false,
              host: config.get<string>('REDIS_HOST') ? config.get<string>('REDIS_HOST') : 'redis-lixi',
              port: config.get<string>('REDIS_PORT') ? _.toSafeInteger(config.get<string>('REDIS_PORT')) : 6379,
            })
          }
        }
      }
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
    HeathController,
    UploadFilesController,
    CountryController,
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
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(baseCorsConfig)
      .forRoutes({ path: '/api/claims/validate', method: RequestMethod.POST })
  }
}
