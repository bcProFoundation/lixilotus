import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { EthersModule } from 'nestjs-ethers';
import { AcceptLanguageResolver, HeaderResolver, I18nModule } from 'nestjs-i18n';
import path, { join } from 'path';
import { NotificationModule } from './common/modules/notifications/notification.module';
import config from './config/config';
import { GraphqlConfig } from './config/config.interface';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './modules/core/core.module';
import { LixiNftModule } from './modules/nft/lixinft.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { WalletModule } from './modules/wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    PrismaModule,
    ServeStaticModule.forRoot({
      serveRoot: '/api/images',
      rootPath: join(__dirname, '..', 'public/images')
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config]
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true
      },
      resolvers: [{ use: HeaderResolver, options: ['lang'] }, AcceptLanguageResolver]
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
    WalletModule,
    AuthModule,
    LixiNftModule,
    CoreModule,
    NotificationModule
  ],
  controllers: [],
  providers: []
})
export class AppModule { }
