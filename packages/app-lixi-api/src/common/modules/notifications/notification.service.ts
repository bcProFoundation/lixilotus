// import { NotificationDto as Notification, NotificationTypeDto as NotificationType } from '@bcpros/lixi-models';
import { BurnCommand, BurnType, NotificationDto, SendNotificationJobData } from '@bcpros/lixi-models';
import { Account } from '@bcpros/lixi-prisma';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Notification as NotificationDb, NotificationLevel as NotificationLevelDb, Prisma } from '@prisma/client';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import _ from 'lodash';
import { I18n, I18nService } from 'nestjs-i18n';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { template } from 'src/utils/stringTemplate';
import { VError } from 'verror';
import { NOTIFICATION_OUTBOUND_QUEUE, WEBPUSH_NOTIFICATION_QUEUE } from './notification.constants';
import { NotificationGateway } from './notification.gateway';
import { PushSubscription } from 'web-push';
import { WebpushNotificationJobData } from './webpush-notification.process';

@Injectable()
export class NotificationService {
  private logger: Logger = new Logger('NotificationService');

  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationGateway,
    @InjectQueue(NOTIFICATION_OUTBOUND_QUEUE) private notificationOutboundQueue: Queue,
    @InjectQueue(WEBPUSH_NOTIFICATION_QUEUE) private webpushQueue: Queue,
    @InjectRedis() private readonly redis: Redis,
    @I18n() private i18n: I18nService
  ) { }

  async saveAndDispatchNotification(notification: NotificationDto) {
    if (!notification.recipientId) {
      const accountNotExistMessage = await this.i18n.t('account.messages.accountNotExist');
      this.logger.error(accountNotExistMessage);
      return;
    }

    // get recipient account
    const recipientAccount = await this.prisma.account.findUnique({
      where: {
        id: notification.recipientId
      }
    });
    if (!recipientAccount) {
      const accountNotExistMessage = await this.i18n.t('account.messages.accountNotExist');
      this.logger.error(new VError(accountNotExistMessage));
      return;
    }

    // Find all the devices which are currently only
    // and associated to that paticular address
    const deviceIds = await this.redis.smembers(`online:user:${recipientAccount.address}`);

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

    // caching
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

    // The rooms are the list of devices
    // Each room is a device
    const rooms = deviceIds.map(deviceId => {
      return `device:${deviceId}`;
    });

    // If that paticular user not online
    // means that there're no devices currently online which associates to the address
    // then we send the webpush notification
    if (rooms.length == 0) {
      // Find the associated addresses
      const subscribers = await this.prisma.webpushSubscriber.findMany({
        where: {
          address: recipientAccount.address
        }
      });

      _.map(subscribers, async subscriber => {
        const pushSubscription: PushSubscription = {
          endpoint: subscriber.endpoint,
          keys: {
            p256dh: subscriber.p256dh,
            auth: subscriber.auth
          }
        };

        const webpushJobData: WebpushNotificationJobData = {
          pushSubObj: pushSubscription,
          address: subscriber.address,
          notification: { ...notif }
        };

        await this.webpushQueue.add('send-webpush-notification', webpushJobData);
      });

    } else {
      // User currently online, we send in-app notification
      // Dispatch the notification
      _.map(rooms, async room => {
        const sendNotifJobData: SendNotificationJobData = {
          room,
          notification: { ...notif } as NotificationDto
        };
        await this.notificationOutboundQueue.add('send-notification', sendNotifJobData);
      });
    }
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
