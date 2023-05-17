import { Logger, Module } from '@nestjs/common';
import { TokenResolver } from './token.resolver';
import { AuthModule } from '../auth/auth.module';
import { TokenController } from '../core/token/token.controller';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import _ from 'lodash';
import { NOTIFICATION_OUTBOUND_QUEUE } from 'src/common/modules/notifications/notification.constants';
import IORedis from 'ioredis';

@Module({
  imports: [
    AuthModule,
    BullModule.registerQueueAsync({
      //Register for follow model
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
  providers: [TokenResolver, Logger],
  exports: []
})
export class TokenModule {}
