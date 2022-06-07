// import { NotificationDto as Notification, NotificationTypeDto as NotificationType } from '@bcpros/lixi-models';
import { NotificationDto, SendNotificationJobData } from '@bcpros/lixi-models';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Notification as NotificationDb, NotificationLevel as NotificationLevelDb, Prisma } from '@prisma/client';
import { Queue } from 'bullmq';
import { I18n, I18nService } from 'nestjs-i18n';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { NOTIFICATION_OUTBOUND_QUEUE } from './notification.constants';

@Injectable()
export class NotificationService {

  private logger: Logger = new Logger('NotificationService');

  constructor(
    private prisma: PrismaService,
    @InjectQueue(NOTIFICATION_OUTBOUND_QUEUE) private notificationOutboundQueue: Queue,
    @I18n() private i18n: I18nService
  ) {
  }

  async saveAndDispatchNotification(room: string, notification: NotificationDto) {

    // Save to the database
    const notif: NotificationDb = await this.prisma.notification.create({
      data: {
        senderId: notification.senderId,
        recipientId: notification.recipientId,
        level: notification.level as NotificationLevelDb,
        action: notification.action,
        message: notification.message,
        notificationTypeId: notification.notificationTypeId as number,
        additionalData: notification.additionalData as Prisma.InputJsonValue,
      }
    });

    // Dispatch the notification
    const sendNotifJobData: SendNotificationJobData = {
      room,
      notification: { ...notif } as NotificationDto
    };
    const job = await this.notificationOutboundQueue.add('send-notification', sendNotifJobData);
    return job.id;
  }


}