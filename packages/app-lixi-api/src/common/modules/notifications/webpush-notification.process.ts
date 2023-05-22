import { Notification } from '@bcpros/lixi-prisma';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import * as webPush from 'web-push';

import { WEBPUSH_NOTIFICATION_QUEUE } from './notification.constants';

const TTL = 86400;

export interface WebpushNotificationJobData {
  pushSubObj: webPush.PushSubscription;
  address: string;
  notification: Notification;
}

@Injectable()
@Processor(WEBPUSH_NOTIFICATION_QUEUE)
export class WebpushNotificationProcessor extends WorkerHost {
  private logger: Logger = new Logger(WebpushNotificationProcessor.name);

  constructor(private prisma: PrismaService) {
    webPush.setVapidDetails(
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
    const { pushSubObj, notification } = job.data;

    try {
      webPush
        .sendNotification(pushSubObj, JSON.stringify(notification), { TTL })
        .then(result => {})
        .catch(error => {
          if (error.statusCode === 404 || error.statusCode === 410) {
            // delete the subscription
            this.removeSubscription(pushSubObj);
          } else {
            throw error;
          }
          this.logger.error(error);
          return false;
        });
    } catch (err) {
      this.logger.error(err);
    }

    return true;
  }

  private async removeSubscription(subscription: webPush.PushSubscription) {
    try {
      await this.prisma.webpushSubscriber.deleteMany({
        where: {
          AND: [
            { endpoint: subscription.endpoint },
            { p256dh: subscription.keys.p256dh },
            { auth: subscription.keys.auth }
          ]
        }
      });
    } catch (error) {
      this.logger.error(error);
    }
  }
}
