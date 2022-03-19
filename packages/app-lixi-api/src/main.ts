import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import config from 'config';
import { PrismaService } from './services/prisma/prisma.service';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';


const bodyParser = require('body-parser');
const compression = require('compression');

const allowedOrigins = [
  'https://lixilotus.com',
  'https://sendlotus.com',
  'https://www.sendlotus.com',
  'https://staging.sendlotus.com',
  'https://dev.sendlotus.com',
  'https://staging.lixilotus.com',
  'https://dev.lixilotus.com',
  'https://vince8x.lixilotus.com'
];

async function bootstrap() {
  const httpsOptions = {
  };

  const isHttps = config.has('https') && config.get('https');

  const app = isHttps ?
    await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ https: httpsOptions })) :
    await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
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

  app.use(helmet());
  app.use(compression());

  const POST_LIMIT = 1024 * 100; /* Max POST 100 kb */

  app.use(
    bodyParser.json({
      limit: POST_LIMIT,
    })
  );

  await app.listen(4800);
}
bootstrap();
