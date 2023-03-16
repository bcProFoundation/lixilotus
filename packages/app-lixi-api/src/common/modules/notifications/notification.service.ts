// import { NotificationDto as Notification, NotificationTypeDto as NotificationType } from '@bcpros/lixi-models';
import { NotificationDto, SendNotificationJobData } from '@bcpros/lixi-models';
import { InjectQueue } from '@nestjs/bullmq';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Notification as NotificationDb, NotificationLevel as NotificationLevelDb, Prisma } from '@prisma/client';
import { Queue } from 'bullmq';
import { I18n, I18nService } from 'nestjs-i18n';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { NOTIFICATION_OUTBOUND_QUEUE } from './notification.constants';
import { VError } from 'verror';
import { template } from 'src/utils/stringTemplate';

@Injectable()
export class NotificationService {
  private logger: Logger = new Logger('NotificationService');

  constructor(
    private prisma: PrismaService,
    @InjectQueue(NOTIFICATION_OUTBOUND_QUEUE) private notificationOutboundQueue: Queue,
    @I18n() private i18n: I18nService
  ) {}

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
        additionalData: notification.additionalData as Prisma.InputJsonValue
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

  async createNotification(notification: NotificationDto) {
    try {
      // get recipient account
      const recipientAccount = await this.prisma.account.findUnique({
        where: {
          id: notification.recipientId as number
        }
      })
      if (!recipientAccount) {
        const accountNotExistMessage = await this.i18n.t('account.messages.accountNotExist');
        throw new VError(accountNotExistMessage);
      }

      // Find notification types and create messenge
      const notifType = await this.prisma.notificationType.findFirst({
        where: {
          id: notification.notificationTypeId as number
        },
        include: {
          notificationTypeTranslations: true
        }
      });
      if (!notifType) return null;

      const translateTemplate: string =
      notifType.notificationTypeTranslations.find(x => x.language == recipientAccount?.language)?.template ??
      notifType.notificationTypeTranslations.find(x => x.isDefault)?.template ??
      '';

      const message = template(translateTemplate, notification.additionalData);

      // return
      const result = await this.prisma.notification.create({
        data: {
          senderId: notification.senderId,
          recipientId: notification.recipientId,
          notificationTypeId: notification.notificationTypeId as number,
          level: notification.level as NotificationLevelDb,
          additionalData: notification.additionalData,
          message: message,
          status: 'active',
          url: notification.url
        }
      })

      return result
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableCreateNotification = await this.i18n.t('notification.messages.unableCreateNotification');
        const error = new VError.WError(err as Error, unableCreateNotification);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
