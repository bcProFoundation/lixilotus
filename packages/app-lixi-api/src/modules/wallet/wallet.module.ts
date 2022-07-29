import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SlpWallet from '@bcpros/minimal-xpi-slp-wallet';
import { WalletService } from './wallet.service';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: 'xpiWallet',
      useFactory: (config: ConfigService) => {
        const xpiRestUrl = config.get<string>('XPI_REST_URL') ?? 'https://api.sendlotus.com/v4/';
        const ConstructedSlpWallet = new SlpWallet('', {
          restURL: xpiRestUrl,
          hdPath: "m/44'/10605'/0'/0/0"
        });
        return ConstructedSlpWallet;
      },
      inject: [ConfigService]
    },
    {
      provide: 'xpijs',
      useFactory: (xpiWallet: any) => {
        return xpiWallet.bchjs;
      },
      inject: [{ token: 'xpiWallet', optional: false }]
    },
    WalletService
  ],
  exports: ['xpiWallet', 'xpijs', WalletService]
})
export class WalletModule {}
