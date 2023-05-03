import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { PushSubscription, sendNotification, setVapidDetails } from 'web-push';
import { WEBPUSH_NOTIFICATION_QUEUE } from './notification.constants';

export interface WebpushNotificationJobData {
  clientAppId: string;
  pushSubObj: PushSubscription;
}

@Injectable()
@Processor(WEBPUSH_NOTIFICATION_QUEUE)
export class WebpushNotificationProcessor extends WorkerHost {
  constructor(private prisma: PrismaService) {
    setVapidDetails(
      'mailto:info@lixilotus.com',
      process.env.PUBLIC_VAPID_KEY ?? '',
      process.env.PRIVATE_VAPID_KEY ?? ''
    );
    super();
  }

  /**
   * Process the notification by sending it to the room socket
   * @param job The notification job to process
   * @returns The process is success or not
   */
  public async process(job: Job<WebpushNotificationJobData, boolean, string>): Promise<boolean> {
    const { clientAppId, pushSubObj } = job.data;
    // sendNotification(pushSubObj)
    return true;
  }
}
