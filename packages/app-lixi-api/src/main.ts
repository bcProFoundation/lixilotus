import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './middlewares/exception.filter';
import helmet from 'helmet';
import config from 'config';
import fs from 'fs';
import path from 'path';
import { NestApplicationOptions } from '@nestjs/common';
import { PrismaService } from './services/prisma/prisma.service';


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
];

async function bootstrap() {
  let nestApplicationOptions: NestApplicationOptions = {};
  try {
    nestApplicationOptions.httpsOptions = {
    };
  } catch (err) {
    console.log(err);
  }

  const isHttps = config.has('https') && config.get('https') && nestApplicationOptions?.httpsOptions?.key !== undefined;

  const app = isHttps ?
    await NestFactory.create(AppModule, nestApplicationOptions) :
    await NestFactory.create(AppModule);
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
