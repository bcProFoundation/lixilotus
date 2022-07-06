import { MailerService } from '@nestjs-modules/mailer';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { MailJobData } from './interface/mail-job.interface';
import { MAIL_QUEUE } from './mail.constants';

@Processor(MAIL_QUEUE)
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly config: ConfigService, private readonly mailerService: MailerService) {
    super();
  }

  public async process(job: Job<MailJobData, boolean, string>): Promise<any> {
    const { payload, type } = job.data;
    this.logger.log(`Sending email to '${payload.to}'`);
    try {
      const options: Record<string, any> = {
        to: payload.to,
        from: this.config.get<string>('MAIL_FROM'),
        subject: payload.subject,
        template: 'email-layout',
        context: payload.context,
        attachments: payload.attachments
      };
      return await this.mailerService.sendMail({ ...options });
    } catch (error) {
      this.logger.error(`Failed to send email to '${job.data.payload.to}'`, (error as any).stack);
      throw error;
    }
  }
}
