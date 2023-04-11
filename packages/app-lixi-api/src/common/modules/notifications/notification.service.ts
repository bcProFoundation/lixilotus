// import { NotificationDto as Notification, NotificationTypeDto as NotificationType } from '@bcpros/lixi-models';
import { BurnCommand, BurnType, NotificationDto, SendNotificationJobData } from '@bcpros/lixi-models';
import { InjectQueue } from '@nestjs/bullmq';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Notification as NotificationDb, NotificationLevel as NotificationLevelDb, Prisma } from '@prisma/client';
import { Queue } from 'bullmq';
import { I18n, I18nService } from 'nestjs-i18n';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { NOTIFICATION_OUTBOUND_QUEUE } from './notification.constants';
import { VError } from 'verror';
import { template } from 'src/utils/stringTemplate';
import _ from 'lodash';
import { Account } from '@bcpros/lixi-prisma';

@Injectable()
export class NotificationService {
  private logger: Logger = new Logger('NotificationService');

  constructor(
    private prisma: PrismaService,
    @InjectQueue(NOTIFICATION_OUTBOUND_QUEUE) private notificationOutboundQueue: Queue,
    @I18n() private i18n: I18nService
  ) {}

  async saveAndDispatchNotification(room: string, notification: NotificationDto) {
    if (!notification.recipientId) {
      const accountNotExistMessage = await this.i18n.t('account.messages.accountNotExist');
      throw new VError(accountNotExistMessage);
    }

    // get recipient account
    const recipientAccount = await this.prisma.account.findUnique({
      where: {
        id: notification.recipientId
      }
    });
    if (!recipientAccount) {
      const accountNotExistMessage = await this.i18n.t('account.messages.accountNotExist');
      throw new VError(accountNotExistMessage);
    }

    // @todo: Find notification types and create messenge
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

    // Save to the database
    const notif: NotificationDb = await this.prisma.notification.create({
      data: {
        senderId: notification.senderId,
        recipientId: notification.recipientId,
        level: notification.level as NotificationLevelDb,
        action: notification.action,
        message: message,
        notificationTypeId: notification.notificationTypeId as number,
        additionalData: notification.additionalData as Prisma.InputJsonValue,
        url: notification.url,
        status: 'active'
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

  async calcTip(post: any, recipient: Account, burn: BurnCommand) {
    const isUpBurn = burn.burnType === BurnType.Up;
    const burnValue = Number(burn.burnValue);

    if (!post.page) {
      return isUpBurn ? burnValue * 0.08 : burnValue * 0.04;
    }

    if (post.page.pageAccountId === recipient.id) {
      return isUpBurn ? burnValue * 0.08 : burnValue * 0.04;
    }

    return isUpBurn ? burnValue * 0.04 : 0;
  }
}
