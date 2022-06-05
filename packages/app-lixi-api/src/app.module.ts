import SlpWallet from '@bcpros/minimal-xpi-slp-wallet';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import config from 'config';
import IORedis from 'ioredis';
import * as _ from 'lodash';
import { EthersModule, RINKEBY_NETWORK, ROPSTEN_NETWORK } from 'nestjs-ethers';
import { AcceptLanguageResolver, HeaderResolver, I18nModule } from 'nestjs-i18n';
import path, { join } from 'path';
import { NOTIFICATION_OUTBOUND_QUEUE } from './common/notifications/notification.constants';
import { NotificationController } from './common/notifications/notification.controller';
import { NotificationGateway } from './common/notifications/notification.gateway';
import { NotificationOutboundProcessor } from './common/notifications/notification.processor';
import { NotificationService } from './common/notifications/notification.service';
import {
  CREATE_SUB_LIXIES_QUEUE,
  EXPORT_SUB_LIXIES_QUEUE,
  WITHDRAW_SUB_LIXIES_QUEUE
} from './constants/lixi.constants';
import { AccountController } from './controller/account.controller';
import { ClaimController } from './controller/claim.controller';
import { EnvelopeController } from './controller/envelope.controller';
import { HeathController } from './controller/heathcheck.controller';
import { LixiController } from './controller/lixi.controller';
import { LixiNftModule } from './modules/nft/lixinft.module';
import { CreateSubLixiesEventsListener } from './processors/create-sub-lixies.eventslistener';
import { CreateSubLixiesProcessor } from './processors/create-sub-lixies.processor';
import { ExportSubLixiesEventsListener } from './processors/export-sub-lixies.eventslistener';
import { ExportSubLixiesProcessor } from './processors/export-sub-lixies.processor';
import { WithdrawSubLixiesEventsListener } from './processors/withdraw-sub-lixies.eventslistener';
import { WithdrawSubLixiesProcessor } from './processors/withdraw-sub-lixies.processor';
import { LixiService } from './services/lixi/lixi.service';
import { PrismaService } from './services/prisma/prisma.service';
import { WalletService } from './services/wallet.service';

const xpiRestUrl = config.has('xpiRestUrl')
  ? config.get('xpiRestUrl')
  : 'https://api.sendlotus.com/v4/';

const ConstructedSlpWallet = new SlpWallet('', {
  restURL: xpiRestUrl,
  hdPath: "m/44'/10605'/0'/0/0",
});

const XpiWalletProvider = {
  provide: 'xpiWallet',
  useValue: ConstructedSlpWallet,
};

const XpijsProvider = {
  provide: 'xpijs',
  useValue: ConstructedSlpWallet.bchjs,
};

@Module({
  imports: [
    ServeStaticModule.forRoot({
      serveRoot: '/api/images',
      rootPath: join(__dirname, '..', 'public/images'),
    }),
    ConfigModule.forRoot({
      isGlobal: true
    }),
    BullModule.registerQueue(
      {
        name: CREATE_SUB_LIXIES_QUEUE,
        connection: new IORedis({
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
          host: process.env.REDIS_HOST ? process.env.REDIS_HOST : 'redis-lixi',
          port: process.env.REDIS_PORT ? _.toSafeInteger(process.env.REDIS_PORT) : 6379,
        }),
        // processors: [
        //   {
        //     path: join(__dirname, 'processors/create-sub-lixies.isolated.processor'),
        //     concurrency: 3,
        //   },
        // ],
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
      {
        name: NOTIFICATION_OUTBOUND_QUEUE,
        connection: new IORedis({
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
          host: process.env.REDIS_HOST ? process.env.REDIS_HOST : 'redis-lixi',
          port: process.env.REDIS_PORT ? _.toSafeInteger(process.env.REDIS_PORT) : 6379,
        }),
      }
    ),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [{ use: HeaderResolver, options: ['lang'] }, AcceptLanguageResolver],
    }),
    EthersModule.forRootAsync({
      providers: [ConfigService],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const etherNetworkUrl = config.get<string>('ETHER_NETWORK_URL');
        return {
          network: { name: 'hardhat', chainId: 31337 },
          custom: etherNetworkUrl,
          useDefaultProvider: false
        };
      }
    }),
    LixiNftModule
  ],
  controllers: [
    AccountController,
    EnvelopeController,
    ClaimController,
    LixiController,
    NotificationController,
    HeathController,
  ],
  providers: [
    PrismaService,
    WalletService,
    LixiService,
    XpiWalletProvider,
    XpijsProvider,
    CreateSubLixiesProcessor,
    CreateSubLixiesEventsListener,
    WithdrawSubLixiesProcessor,
    ExportSubLixiesProcessor,
    ExportSubLixiesEventsListener,
    NotificationGateway,
    WithdrawSubLixiesEventsListener,
    NotificationOutboundProcessor,
    NotificationService
  ],
})
export class AppModule { }
