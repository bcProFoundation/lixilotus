import { BullModule } from '@nestjs/bullmq';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cors from 'cors';
import IORedis from 'ioredis';
import * as _ from 'lodash';
import { NotificationModule } from 'src/common/modules/notifications/notification.module';
import { ChronikModule } from '../../common/modules/chronik/chronik.module';
import { AuthModule } from '../auth/auth.module';
import { AccountController } from './account/account.controller';
import { BurnController } from './burn/burn.controller';
import { ClaimController } from './claim/claim.controller';
import { CountryController } from './country/country.controller';
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
import { UploadFilesController } from './upload/upload.controller';
import { UploadService } from './upload/upload.service';
import { TokenController } from './token/token.controller';
import { CategoryController } from './category/category.controller';
import { NOTIFICATION_OUTBOUND_QUEUE } from 'src/common/modules/notifications/notification.constants';
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
              port: config.get<string>('REDIS_PORT') ? _.toSafeInteger(config.get<string>('REDIS_PORT')) : 6379
            })
          };
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
              port: config.get<string>('REDIS_PORT') ? _.toSafeInteger(config.get<string>('REDIS_PORT')) : 6379
            })
          };
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
              port: config.get<string>('REDIS_PORT') ? _.toSafeInteger(config.get<string>('REDIS_PORT')) : 6379
            })
          };
        }
      },
      {
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
      }
    ),
    ChronikModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const chronikUrl = config.get<string>('CHRONIK_URL') || 'https://chronik.be.cash';
        return {
          host: chronikUrl,
          networks: ['xec', 'xpi']
        };
      }
    }),
    AuthModule,
    NotificationModule
  ],
  controllers: [
    AccountController,
    LixiController,
    ClaimController,
    EnvelopeController,
    HeathController,
    UploadFilesController,
    TokenController,
    CountryController,
    BurnController,
    CategoryController
  ],
  providers: [
    LixiService,
    UploadService,
    CreateSubLixiesProcessor,
    CreateSubLixiesEventsListener,
    WithdrawSubLixiesProcessor,
    ExportSubLixiesProcessor,
    ExportSubLixiesEventsListener,
    WithdrawSubLixiesEventsListener
  ],
  exports: [
    LixiService,
    UploadService,
    CreateSubLixiesProcessor,
    CreateSubLixiesEventsListener,
    WithdrawSubLixiesProcessor,
    ExportSubLixiesProcessor,
    ExportSubLixiesEventsListener,
    WithdrawSubLixiesEventsListener
  ]
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(baseCorsConfig).forRoutes({ path: '/api/claims/validate', method: RequestMethod.POST });
  }
}
