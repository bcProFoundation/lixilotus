import { SendNotificationJobData } from '@bcpros/lixi-models';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { NOTIFICATION_OUTBOUND_QUEUE } from './notification.constants';
import { NotificationGateway } from './notification.gateway';

@Injectable()
@Processor(NOTIFICATION_OUTBOUND_QUEUE)
export class NotificationOutboundProcessor extends WorkerHost {
  private logger: Logger = new Logger(NotificationOutboundProcessor.name);

  constructor(private prisma: PrismaService, private notificationGateway: NotificationGateway) {
    super();
  }

  /**
   * Process the notification by sending it to the room socket
   * @param job The notification job to process
   * @returns The process is success or not
   */
  public async process(job: Job<SendNotificationJobData, boolean, string>): Promise<boolean> {
    try {
      const { room, notification } = job.data;
      if (job.name === 'send-notification') {
        this.notificationGateway.sendNotification(room, notification);
      } else if (job.name === 'new-post') {
        this.notificationGateway.sendNewPostEvent(room, notification);
      }
    } catch (error) {
      this.logger.error(error);
      return false;
    }
    return true;
  }
}
