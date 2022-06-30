import { OnQueueEvent, QueueEventsHost, QueueEventsListener } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { MAIL_QUEUE } from './mail.constants';

@Injectable()
@QueueEventsListener(MAIL_QUEUE)
export class MailEventListener extends QueueEventsHost {
  private readonly logger = new Logger(this.constructor.name);

  constructor() {
    super();
  }

  @OnQueueEvent('completed')
  async onCompleted(
    args: {
      jobId: string;
      returnvalue: any;
      prev?: string;
    },
    id: string
  ) {
    const { jobId, returnvalue } = args;
    this.logger.debug(`Completed job ${jobId}. Result: ${JSON.stringify(returnvalue)}`);
  }

  @OnQueueEvent('active')
  async onActive(
    args: {
      jobId: string;
      prev?: string;
    },
    id: string
  ) {
    const { jobId } = args;
    this.logger.debug(`Processing job ${jobId}. Data: ${JSON.stringify(args)}`);
  }

  @OnQueueEvent('error')
  async onError(args: Error) {
    this.logger.error(`Failed job : ${args.message}`, args.stack);
  }
}
