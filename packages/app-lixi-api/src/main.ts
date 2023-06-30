import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from '@fastify/compress';
import { fastifyCookie } from '@fastify/cookie';
import fastifyHelmet from '@fastify/helmet';
import fastifyCsrf, { FastifyCsrfProtectionOptions } from '@fastify/csrf-protection';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './common/adapters/redis-io.adapter';
import { PrismaService } from './modules/prisma/prisma.service';
import 'winston-daily-rotate-file';
import loggerConfig from './logger.config';
import { join } from 'path';
import { contentParser } from 'fastify-multer';
import { FastifyHelmetOptions } from '@fastify/helmet';
import _ from 'lodash';

const whitelistOrigins = [
  process.env.SENDLOTUS_URL,
  process.env.BASE_URL,
  process.env.ABCPAY_URL,
  process.env.ABCPAY_SWAP_URL,
  process.env.LOTUSTEMPLE_URL,
  process.env.LIXI_SOCIAL_URL
];

function stripTrailingSlash(str: string) {
  return str.replace(/\/$/, '')
}

async function bootstrap() {

  const fastifyAdapter = new FastifyAdapter({
    trustProxy: true
  });
  fastifyAdapter
    .getInstance()
    .addContentTypeParser('application/json', { bodyLimit: 10048576 }, (_request, _payload, done) => {
      done(null, (_payload as any).body);
    });
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    logger: loggerConfig
  });

  await app.register(contentParser);
  app.useStaticAssets({
    root: join(__dirname, '..', 'public'),
    prefix: '/public/'
  });

  app.setGlobalPrefix('api');

  process.on('uncaughtException', function (err) {
    console.log(err);
  });

  const allowedOrigins = _.compact(whitelistOrigins).map(origin => stripTrailingSlash(origin))

  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local'
    ? app.enableCors()
    : app.enableCors({
      credentials: true,
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(stripTrailingSlash(origin)) === -1) {
          const msg = `The CORS policy for this site does not allow access from the specified Origin. ${origin}`;
          console.log(msg);
          return callback(new Error(msg), false);
        }
        return callback(null, true);
      },
      allowedHeaders: 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe',
      methods: "GET,PUT,POST,DELETE,UPDATE,OPTIONS",
      preflightContinue: false,
      optionsSuccessStatus: 200
    });

  // Prisma
  const prismaService: PrismaService = app.get(PrismaService);
  prismaService.enableShutdownHooks(app);

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Lixi API')
    .setDescription('The Lixi API description')
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Redis socket adapter
  app.useWebSocketAdapter(new RedisIoAdapter(app));

  await app.register(fastifyHelmet, {
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`]
      }
    }
  } as FastifyHelmetOptions);

  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET ?? 'my-secret'
  });

  app.register(fastifyCsrf, {
    cookieOpts: {
      signed: true,
      httpOnly: true
    }
  } as FastifyCsrfProtectionOptions);

  app.register(compression);

  await app.listen(process.env.PORT || 4800, '0.0.0.0');
}
bootstrap();
