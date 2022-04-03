import SlpWallet from '@bcpros/minimal-xpi-slp-wallet';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import config from 'config';
import { join } from 'path';
import { LIXI_QUEUE } from './constants/lixi.constants';
import { AccountController } from './controller/account.controller';
import { ClaimController } from './controller/claim.controller';
import { EnvelopeController } from './controller/envelope.controller';
import { HeathController } from './controller/heathcheck.controller';
import { LixiController } from './controller/lixi.controller';
import { LixiService } from './services/lixi/lixi.service';
import { PrismaService } from './services/prisma/prisma.service';
import { WalletService } from "./services/wallet.service";

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
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: LIXI_QUEUE,
    }),
  ],
  controllers: [AccountController, EnvelopeController, ClaimController, LixiController, HeathController],
  providers: [PrismaService, WalletService, LixiService, XpiWalletProvider, XpijsProvider],
})
export class AppModule { }
