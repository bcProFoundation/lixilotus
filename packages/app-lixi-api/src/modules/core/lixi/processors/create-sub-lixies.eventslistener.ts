import { InjectQueue, OnQueueEvent, QueueEventsHost, QueueEventsListener } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { NOTIFICATION_TYPES } from 'src/common/modules/notifications/notification.constants';
import { NotificationService } from 'src/common/modules/notifications/notification.service';
import { CREATE_SUB_LIXIES_QUEUE, LIXI_JOB_NAMES } from 'src/modules/core/lixi/constants/lixi.constants';
import { CreateSubLixiesJobData, CreateSubLixiesJobResult } from 'src/modules/core/lixi/models/lixi.models';
import { LixiService } from 'src/modules/core/lixi/lixi.service';

@Injectable()
@QueueEventsListener(CREATE_SUB_LIXIES_QUEUE)
export class CreateSubLixiesEventsListener extends QueueEventsHost {
  private logger: Logger = new Logger(CreateSubLixiesEventsListener.name);

  constructor(
    @InjectQueue(CREATE_SUB_LIXIES_QUEUE) private someQueue: Queue,
    private readonly lixiService: LixiService,
    private readonly notificationService: NotificationService
  ) {
    super();
  }

  @OnQueueEvent('completed')
  async completed(
    args: {
      jobId: string;
      returnvalue: CreateSubLixiesJobResult;
      prev?: string;
    },
    id: string
  ) {
    const { id: lixiId, jobName, mnemonicHash, senderId, recipientId } = args.returnvalue;

    if (jobName === LIXI_JOB_NAMES.CREATE_ALL_SUB_LIXIES) {
      // Update the status of lixi
      const id = args.returnvalue.id;
      await this.lixiService.updateStatusLixi(id, 'active');

      // The parent job
      const notif = await this.lixiService.buildNotification(
        NOTIFICATION_TYPES.CREATE_SUB_LIXIES,
        senderId,
        recipientId,
        {
          id: args.returnvalue.id,
          name: args?.returnvalue?.name,
          mnemonicHash: args.returnvalue.mnemonicHash
        },
        mnemonicHash
      );

      if (notif) {
        // Notify the clients
        const room = mnemonicHash;
        await this.notificationService.saveAndDispatchNotification(room, notif);
      }
    }
  }

  @OnQueueEvent('failed')
  async failed(
    args: {
      jobId: string;
      failedReason: string;
      prev?: string;
    },
    id: string
  ) {
    const jobId = args.jobId;
    const job = await Job.fromId<CreateSubLixiesJobData, boolean, string>(this.someQueue, jobId);
    if (job && this.someQueue) {
      const { parentId, command } = job.data;
      await this.lixiService.updateStatusLixi(parentId, 'failed');

      const senderId = command.accountId;
      const recipientId = command.accountId;
      const mnemonicHash = command.mnemonicHash;
      const notif = await this.lixiService.buildNotification(
        NOTIFICATION_TYPES.CREATE_SUB_LIXIES_FAILURE,
        senderId,
        recipientId,
        {
          id: parentId,
          name: command.name,
          mnemonicHash: mnemonicHash
        },
        mnemonicHash
      );

      if (notif) {
        // Notify the clients
        const room = mnemonicHash;
        await this.notificationService.saveAndDispatchNotification(room, notif);
      }
    }
  }
}
