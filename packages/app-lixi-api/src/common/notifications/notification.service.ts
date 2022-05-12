// import { NotificationDto as Notification, NotificationTypeDto as NotificationType } from '@bcpros/lixi-models';
import { LixiDto, NotificationDto, SendNotificationJobData, UpdateLixiStatusCommand } from '@bcpros/lixi-models';
import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Notification as NotificationDb, Prisma } from '@prisma/client';
import { Queue } from 'bullmq';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { NOTIFICATION_OUTBOUND_QUEUE } from './notification.constants';
import VError from 'verror';
import _ from 'lodash';
import { I18n, I18nContext, I18nService } from 'nestjs-i18n';

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
        level: notification.level,
        action: notification.action,
        message: notification.message,
        notificationTypeId: notification.notificationTypeId,
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

  async updateStatusLixi(id: number, command: UpdateLixiStatusCommand) {
    const account = await this.prisma.account.findFirst({
      where: {
        mnemonicHash: command.mnemonicHash
      }
    });

    if (!account) {
      const couldNotFindAccount = await this.i18n.t('lixi.messages.couldNotFindAccount');
      throw new Error(couldNotFindAccount);
    }

    const lixi = await this.prisma.lixi.findUnique({
      where: {
        id: _.toSafeInteger(id)
      }
    });
    if (!lixi) {
      const lixiNotExist = await this.i18n.t('lixi.messages.lixiNotExist');
      throw new VError(lixiNotExist);
    }

    const updatedLixi = await this.prisma.lixi.update({
      where: {
        id: _.toSafeInteger(id)
      },
      data: {
        status: command.status,
        updatedAt: new Date()
      }
    });

    if (updatedLixi) {
      let resultApi: LixiDto = {
        ...lixi,
        name: updatedLixi.name,
        totalClaim: Number(lixi.totalClaim),
        expiryAt: lixi.expiryAt ? lixi.expiryAt : undefined,
        activationAt: lixi.activationAt ? lixi.activationAt : undefined,
        country: lixi.country ? lixi.country : undefined,
        status: lixi.status,
        numberOfSubLixi: lixi.numberOfSubLixi ?? 0,
        parentId: lixi.parentId ?? undefined,
        isClaimed: lixi.isClaimed ?? false
      };
      return resultApi;
    }
  }
}