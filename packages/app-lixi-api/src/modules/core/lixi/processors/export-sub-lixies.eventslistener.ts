import { OnQueueEvent, QueueEventsHost, QueueEventsListener } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { NOTIFICATION_TYPES } from 'src/common/modules/notifications/notification.constants';
import { NotificationService } from 'src/common/modules/notifications/notification.service';
import { EXPORT_SUB_LIXIES_QUEUE } from 'src/modules/core/lixi/constants/lixi.constants';
import { ExportSubLixiesJobResult } from 'src/modules/core/lixi/models/lixi.models';
import { LixiService } from 'src/modules/core/lixi/lixi.service';

@Injectable()
@QueueEventsListener(EXPORT_SUB_LIXIES_QUEUE)
export class ExportSubLixiesEventsListener extends QueueEventsHost {
  constructor(private readonly lixiService: LixiService, private readonly notificationService: NotificationService) {
    super();
  }

  @OnQueueEvent('completed')
  async completed(
    args: {
      jobId: string;
      returnvalue: ExportSubLixiesJobResult;
      prev?: string;
    },
    id: string
  ) {
    const { senderId, recipientId, mnemonicHash } = args.returnvalue;

    // Build and dispatch notification
    const notif = await this.lixiService.buildNotification(
      NOTIFICATION_TYPES.EXPORT_SUB_LIXIES,
      senderId,
      recipientId,
      {
        name: args?.returnvalue?.name,
        path: args?.returnvalue.path,
        fileName: args?.returnvalue.fileName,
        mnemonicHash: args?.returnvalue.mnemonicHash,
        parentId: args?.returnvalue.id
      },
      mnemonicHash
    );
    if (notif) {
      const room = mnemonicHash;
      await this.notificationService.saveAndDispatchNotification(room, notif);
    }
  }
}
