import SlpWallet from '@bcpros/minimal-xpi-slp-wallet';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import config from 'config';
import { join } from 'path';
import { CREATE_SUB_LIXIES_QUEUE, WITHDRAW_SUB_LIXIES_QUEUE } from './constants/lixi.constants';
import { AccountController } from './controller/account.controller';
import { ClaimController } from './controller/claim.controller';
import { EnvelopeController } from './controller/envelope.controller';
import { HeathController } from './controller/heathcheck.controller';
import { LixiController } from './controller/lixi.controller';
import { LixiService } from './services/lixi/lixi.service';
import { PrismaService } from './services/prisma/prisma.service';
import { WalletService } from "./services/wallet.service";
import IORedis from 'ioredis';
import { CreateSubLixiesProcessor } from './processors/create-sub-lixies.processor';
import { CreateSubLixiesEventsListener } from './processors/create-sub-lixies.eventslistener';
import { WithdrawSubLixiesProcessor } from './processors/withdraw-sub-lixies.processor';


const xpiRestUrl = config.has('xpiRestUrl')
  ? config.get('xpiRestUrl')
  : 'https://api.sendlotus.com/v4/';

const ConstructedSlpWallet = new SlpWallet('', {
  restURL: xpiRestUrl,
  hdPath: "m/44'/10605'/0'/0/0",
});

const XpiWalletProvider = {
  provide: 'xpiWallet',
  useValue: ConstructedSlpWallet
};

const XpijsProvider = {
  provide: 'xpijs',
  useValue: ConstructedSlpWallet.bchjs
};

@Module({
  imports: [
    ServeStaticModule.forRoot({
      serveRoot: '/api/images',
      rootPath: join(__dirname, '..', 'public/images'),
    }),
    BullModule.forRoot({
    }),
    BullModule.registerQueue(
    {
      name: CREATE_SUB_LIXIES_QUEUE,
      connection: new IORedis({
        maxRetriesPerRequest: null,
        enableReadyCheck: false
      }),
      processors: [
        {
          path: join(__dirname, 'processors/create-sub-lixies.isolated.processor'),
          concurrency: 3
        }
      ]
    },
    {
      name: WITHDRAW_SUB_LIXIES_QUEUE,
      connection: new IORedis({
        maxRetriesPerRequest: null,
        enableReadyCheck: false
      }),
    }),
  ],
  controllers: [AccountController, EnvelopeController, ClaimController, LixiController, HeathController],
  providers: [PrismaService, WalletService, LixiService, XpiWalletProvider, XpijsProvider,
     CreateSubLixiesProcessor, CreateSubLixiesEventsListener, WithdrawSubLixiesProcessor],
})
export class AppModule { }
