import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AccountController } from './controller/account.controller';
import { HeathController } from './controller/heathcheck.controller';
import { WalletService } from "./services/wallet.service";
import SlpWallet from '@bcpros/minimal-xpi-slp-wallet';
import { EnvelopeController } from './controller/envelope.controller';
import { ClaimController } from './controller/claim.controller';
import { LixiController } from './controller/lixi.controller';
import config from 'config';
import { PrismaService } from './services/prisma/prisma.service';

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
    })
  ],
  controllers: [AccountController, EnvelopeController, ClaimController, LixiController, HeathController],
  providers: [PrismaService, WalletService, XpiWalletProvider, XpijsProvider],
})
export class AppModule { }
