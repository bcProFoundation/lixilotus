import { NotificationDto, SendNotificationJobData } from '@bcpros/lixi-models';
import { Notification as NotificationDb, NotificationLevel as NotificationLevelDb, Prisma } from '@prisma/client';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { NOTIFICATION_JOB_NAME, NOTIFICATION_OUTBOUND_QUEUE } from './notification.constants';
import { NotificationGateway } from './notification.gateway';
import { template } from 'src/utils/stringTemplate';
import VError from 'verror';
import { I18n, I18nService } from 'nestjs-i18n';
import { NotificationService } from './notification.service';

@Injectable()
@Processor(NOTIFICATION_OUTBOUND_QUEUE)
export class NotificationOutboundProcessor extends WorkerHost {
  private logger: Logger = new Logger(this.constructor.name);

  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationGateway,
    private readonly notificationService: NotificationService,
    @I18n() private i18n: I18nService
  ) {
    super();
  }

  /**
   * Process the notification by sending it to the room socket
   * @param job The notification job to process
   * @returns The process is success or not
   */
  public async process(job: Job<SendNotificationJobData, boolean, string>): Promise<boolean> {
    if (Object.values(NOTIFICATION_JOB_NAME).includes(job.name)) {
      const { room, notification } = job.data;
      await this.notificationService.saveAndDispatchNotification(room, notification);
    }
    const { room, notification } = job.data;
    this.notificationGateway.sendNotification(room, notification);
    return true;
  }
}
