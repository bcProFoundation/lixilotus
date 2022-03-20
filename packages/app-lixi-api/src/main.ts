import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './services/prisma/prisma.service';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import compression from 'fastify-compress';
import { fastifyHelmet } from 'fastify-helmet';

const allowedOrigins = [
  'https://lixilotus.com',
  'https://sendlotus.com',
  'https://www.sendlotus.com',
  'https://staging.sendlotus.com',
  'https://dev.sendlotus.com',
  'https://staging.lixilotus.com',
  'https://dev.lixilotus.com',
  'https://vince8x.lixilotus.com',
  'https://givegift.test'
];

async function bootstrap() {
  const httpsOptions = {
  };

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
  // app.useGlobalFilters(new HttpExceptionFilter());

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

  const prismaService: PrismaService = app.get(PrismaService);
  prismaService.enableShutdownHooks(app);

  await app.register(fastifyHelmet);
  app.register(compression);

  await app.listen(4800);
}
bootstrap();
