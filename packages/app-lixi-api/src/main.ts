import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'fastify-compress';
import { fastifyHelmet } from 'fastify-helmet';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './common/adapters/redis-io.adapter';
import { HttpExceptionFilter } from './middlewares/exception.filter';
import { PrismaService } from './services/prisma/prisma.service';

const allowedOrigins = [
  'https://lixilotus.com',
  'https://sendlotus.com',
  'https://www.sendlotus.com',
  'https://staging.sendlotus.com',
  'https://dev.sendlotus.com',
  'https://staging.lixilotus.com',
  'https://dev.lixilotus.com',
  'https://vince8x.lixilotus.com',
  'https://sendlotus.test',
];

async function bootstrap() {

  const POST_LIMIT = 1024 * 100; /* Max POST 100 kb */

  const fastifyAdapter = new FastifyAdapter();
  fastifyAdapter.getInstance().addContentTypeParser(
    'application/json',
    { bodyLimit: POST_LIMIT },
    (_request, _payload, done) => {
      done(null, (_payload as any).body);
    }
  );
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());

  process.on('uncaughtException', function (err) {
    console.log(err);
  });

  process.env.NODE_ENV === 'development'
    ? app.enableCors()
    : app.enableCors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
          const msg =
            'The CORS policy for this site does not allow access from the specified Origin.';
          return callback(new Error(msg), false);
        }
        return callback(null, true);
      },
    });

  // Prisma
  const prismaService: PrismaService = app.get(PrismaService);
  prismaService.enableShutdownHooks(app);

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('LixiLotus API')
    .setDescription('The LixiLotus API description')
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
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
  });
  app.register(compression);

  await app.listen(process.env.PORT || 4800, '0.0.0.0');
}
bootstrap();
