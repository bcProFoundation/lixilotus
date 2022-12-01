import { Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { ServeStaticModule, ServeStaticModuleOptions } from '@nestjs/serve-static';
import { MeiliSearchModule } from 'nestjs-meilisearch';
import { EthersModule } from 'nestjs-ethers';
import { FastifyRequest } from 'fastify';
import { AcceptLanguageResolver, HeaderResolver, I18nModule } from 'nestjs-i18n';
import path, { join } from 'path';
import { NotificationModule } from './common/modules/notifications/notification.module';
import { GraphqlConfig } from './config/config.interface';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './modules/core/core.module';
import { LixiNftModule } from './modules/nft/lixinft.module';
import { PageModule } from './modules/page/page.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './middlewares/exception.filter';
import { S3Module } from 'nestjs-s3';

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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    }),
    PrismaModule,
    ServeStaticModule.forRoot(serveStaticModule_images),
    GraphQLModule.forRootAsync<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      useFactory: async (configService: ConfigService) => {
        const graphqlConfig = configService.get<GraphqlConfig>('graphql');
        return {
          graphiql: graphqlConfig?.playgroundEnabled || true,
          installSubscriptionHandlers: true,
          buildSchemaOptions: {
            numberScalarMode: 'integer'
          },
          sortSchema: graphqlConfig?.sortSchema || true,
          autoSchemaFile: graphqlConfig?.schemaDestination || './schema.graphql',
          debug: graphqlConfig?.debug,
          formatError: (error: GraphQLError) => {
            const graphQLFormattedError: GraphQLFormattedError = {
              message: (error?.extensions?.exception as any)?.response?.message || error?.message
            };
            return graphQLFormattedError;
          },
          context: ({ req }: { req: FastifyRequest }) => ({
            req
          })
        };
      },

      inject: [ConfigService]
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
    MeiliSearchModule.forRoot({
      host: 'http://localhost:7700',
      apiKey: process.env.MEILISEARCH_MASTER_KEY
    }),
    WalletModule,
    AuthModule,
    LixiNftModule,
    CoreModule,
    NotificationModule,
    PageModule,
    S3Module.forRootAsync({
      useFactory: () => ({
        config: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          endpoint: process.env.AWS_ENDPOINT,
          s3ForcePathStyle: true,
          signatureVersion: 'v4'
        }
      })
    })
  ],
  controllers: [],
  providers: [
    Logger,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    }
  ]
})
export class AppModule implements OnApplicationShutdown {
  onApplicationShutdown(signal: string) {
    console.trace(`Application shut down (signal: ${signal})`);
  }
}
