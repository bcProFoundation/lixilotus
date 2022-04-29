import { OnQueueEvent, QueueEventsHost, QueueEventsListener } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { NOTIFICATION_TYPES } from "src/common/notifications/notification.constants";
import { NotificationService } from "src/common/notifications/notification.service";
import { CREATE_SUB_LIXIES_QUEUE, LIXI_JOB_NAMES } from "src/constants/lixi.constants";
import { CreateSubLixiesJobResult } from "src/models/lixi.models";
import { LixiService } from "src/services/lixi/lixi.service";

@Injectable()
@QueueEventsListener(CREATE_SUB_LIXIES_QUEUE)
export class CreateSubLixiesEventsListener extends QueueEventsHost {

  constructor(
    private readonly lixiService: LixiService,
    private readonly notificationService: NotificationService
  ) {
    super();
  }

  @OnQueueEvent('completed')
  async completed(args: {
    jobId: string;
    returnvalue: CreateSubLixiesJobResult;
    prev?: string;
  }, id: string) {
    const { id: lixiId, jobName, mnemonicHash, senderId, recipientId } = args.returnvalue;

    if (jobName === LIXI_JOB_NAMES.CREATE_ALL_SUB_LIXIES) {
      // The parent job
      const notif = await this.lixiService.buildNotification(
        NOTIFICATION_TYPES.CREATE_SUB_LIXIES,
        senderId, recipientId, { name: args?.returnvalue?.name }
      );
      if (notif) {
        const room = mnemonicHash;
        await this.notificationService.saveAndDispatchNotification(room, notif);
      }
    }
  }
}