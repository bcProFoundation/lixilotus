import { RedisClientOptions, RedisModule } from '@liaoliaots/nestjs-redis';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { ServeStaticModule, ServeStaticModuleOptions } from '@nestjs/serve-static';
import { redisStore } from 'cache-manager-ioredis-yet';
import { FastifyRequest } from 'fastify';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import IORedis from 'ioredis';
import * as _ from 'lodash';
import { AcceptLanguageResolver, HeaderResolver, I18nModule } from 'nestjs-i18n';
import { MeiliSearchModule } from 'nestjs-meilisearch';
import { S3Module } from 'nestjs-s3';
import path, { join } from 'path';
import { NotificationModule } from './common/modules/notifications/notification.module';
import { GraphqlConfig } from './config/config.interface';
import configuration from './config/configuration';
import { HttpExceptionFilter } from './middlewares/exception.filter';
import { AccountModule } from './modules/account/account.module';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './modules/core/core.module';
import { PageModule } from './modules/page/page.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { TempleModule } from './modules/temple/temple.module';
import { TokenModule } from './modules/token/token.module';
import { HashtagModule } from './modules/hashtag/hashtag.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { WorshipModule } from './modules/worship/worship.module';

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
    CacheModule.registerAsync<RedisClientOptions>({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          store: redisStore,
          host: config.get<string>('REDIS_HOST') ? config.get<string>('REDIS_HOST') : 'redis-lixi',
          port: config.get<string>('REDIS_PORT') ? _.toSafeInteger(config.get<string>('REDIS_PORT')) : 6379
        };
      }
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          connection: new IORedis({
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            host: config.get<string>('REDIS_HOST') ? config.get<string>('REDIS_HOST') : 'redis-lixi',
            port: config.get<string>('REDIS_PORT') ? _.toSafeInteger(config.get<string>('REDIS_PORT')) : 6379
          })
        };
      }
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
    MeiliSearchModule.forRootAsync({
      useFactory: () => ({
        host: process.env.MEILISEARCH_HOST!,
        apiKey: process.env.MEILISEARCH_MASTER_KEY
      })
    }),
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        config: {
          host: config.get<string>('REDIS_HOST') ? config.get<string>('REDIS_HOST') : 'redis-lixi',
          port: config.get<string>('REDIS_PORT') ? _.toSafeInteger(config.get<string>('REDIS_PORT')) : 6379
        }
      })
    }),
    WalletModule,
    AuthModule,
    CoreModule,
    NotificationModule,
    AccountModule,
    PageModule,
    TokenModule,
    WorshipModule,
    TempleModule,
    HashtagModule,
    S3Module.forRootAsync({
      useFactory: () => ({
        config: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          endpoint: process.env.AWS_ENDPOINT,
          s3ForcePathStyle: true,
          signatureVersion: 'v4',
          region: 'us-west-001'
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
  ],
  exports: [RedisModule]
})
export class AppModule implements OnApplicationShutdown {
  onApplicationShutdown(signal: string) {
    console.trace(`Application shut down (signal: ${signal})`);
  }
}
