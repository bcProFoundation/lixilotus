import { Injectable } from '@nestjs/common';

import { MAIL_QUEUE } from './mail.constants';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { EmailTemplateService } from '../email-template/email-template.service';
import { MailJobInterface } from './interface/mail-job.interface';

@Injectable()
export class MailService {
  constructor(
    @InjectQueue(MAIL_QUEUE)
    private mailQueue: Queue,
    private readonly emailTemplateService: EmailTemplateService
  ) { }

  /**
   * Replace place holder
   * @param str
   * @param obj
   */
  stringInject(str = '', obj: any = {}) {
    let newStr = str;
    Object.keys(obj).forEach(key => {
      const placeHolder = `{{${key}}}`;
      if (newStr.includes(placeHolder)) {
        newStr = newStr.replace(placeHolder, obj[key] || ' ');
      }
    });
    return newStr;
  }

  async sendMail(payload: MailJobInterface, type: string): Promise<boolean> {
    const mailBody = await this.emailTemplateService.findBySlug(payload.slug);
    payload.context.content = this.stringInject('', payload.context);
    if (mailBody) {
      try {
        await this.mailQueue.add(type, {
          payload
        });
        return true;
      } catch (error) {
        return false;
      }
    }
    return false;
  }
}
