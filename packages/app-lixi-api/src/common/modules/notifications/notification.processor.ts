import { NotificationDto, SendNotificationJobData } from '@bcpros/lixi-models';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { NOTIFICATION_OUTBOUND_QUEUE } from './notification.constants';
import { NotificationGateway } from './notification.gateway';

@Injectable()
@Processor(NOTIFICATION_OUTBOUND_QUEUE)
export class NotificationOutboundProcessor extends WorkerHost {
  constructor(private prisma: PrismaService, private notificationGateway: NotificationGateway) {
    super();
  }

  /**
   * Process the notification by sending it to the room socket
   * @param job The notification job to process
   * @returns The process is success or not
   */
  public async process(job: Job<SendNotificationJobData, boolean, string>): Promise<boolean> {
    const { room, notification } = job.data;
    this.notificationGateway.sendNotification(room, notification);
    return true;
  }
}
