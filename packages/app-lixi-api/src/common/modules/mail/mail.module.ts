import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import IORedis from 'ioredis';
import * as _ from 'lodash';

import { ConfigService } from '@nestjs/config';
import { EmailTemplateModule } from '../email-template/email-template.module';
import { MAIL_QUEUE } from './mail.constants';
import { MailEventListener } from './mail.eventlistener';
import { MailProcessor } from './mail.processor';
import { MailService } from './mail.service';

@Module({
  imports: [
    EmailTemplateModule,
    BullModule.registerQueueAsync({
      name: MAIL_QUEUE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          name: MAIL_QUEUE,
          connection: new IORedis({
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            host: config.get<string>('REDIS_HOST') ? config.get<string>('REDIS_HOST') : 'redis-lixi',
            port: config.get<string>('REDIS_PORT') ? _.toSafeInteger(config.get<string>('REDIS_PORT')) : 6379,
          })
        }
      }
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('MAIL_HOST'),
          port: _.toSafeInteger(config.get<string>('MAIL_PORT')),
          secure: config.get<string>('MAIL_ENCRYPTION') ? true : false,
          ignoreTLS: config.get<string>('MAIL_ENCRYPTION') == 'tls' ? false : true,
          auth: {
            user: config.get<string>('MAIL_USER'),
            pass: config.get<string>('MAIL_PASS'),
          },
          pool: true
        },
        defaults: {
          from: `"${config.get<string>('MAIL_FROM')}" <${config.get<string>('MAIL_FROM')
            }>`
        },
        template: {
          dir: __dirname + '/templates/email/layouts/',
          adapter: new PugAdapter(),
          options: {
            strict: true
          }
        }
      })
    })
  ],
  controllers: [],
  providers: [MailService, MailProcessor, MailEventListener],
  exports: [MailService]
})
export class MailModule { }
