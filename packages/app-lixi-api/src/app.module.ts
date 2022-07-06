import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule, ServeStaticModuleOptions } from '@nestjs/serve-static';
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

//enabled serving multiple static for fastify
type FastifyServeStaticModuleOptions = ServeStaticModuleOptions & {
  serveStaticOptions: {
      decorateReply: boolean;
  };
};

export const serveStaticModule_images: FastifyServeStaticModuleOptions = {
  serveRoot: '/api/images',
  rootPath: join(__dirname, '..', 'public/images'),
  serveStaticOptions: {
      decorateReply: false
  }
};

export const serveStaticModule_uploads: FastifyServeStaticModuleOptions = {
  serveRoot: '/api/uploads',
  rootPath: join(__dirname, '..', 'public/uploads'),
  serveStaticOptions: {
      decorateReply: false
  }
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    PrismaModule,
    ServeStaticModule.forRoot(serveStaticModule_images),
    ServeStaticModule.forRoot(serveStaticModule_uploads),
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
