import { OnQueueEvent, QueueEventsHost, QueueEventsListener } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { NOTIFICATION_TYPES } from 'src/common/modules/notifications/notification.constants';
import { NotificationService } from 'src/common/modules/notifications/notification.service';
import { WITHDRAW_SUB_LIXIES_QUEUE } from 'src/modules/core/lixi/constants/lixi.constants';
import { WithdrawSubLixiesJobResult } from 'src/modules/core/lixi/models/lixi.models';
import { LixiService } from 'src/modules/core/lixi/lixi.service';

@Injectable()
@QueueEventsListener(WITHDRAW_SUB_LIXIES_QUEUE)
export class WithdrawSubLixiesEventsListener extends QueueEventsHost {
  constructor(private readonly lixiService: LixiService, private readonly notificationService: NotificationService) {
    super();
  }

  @OnQueueEvent('completed')
  async completed(
    args: {
      jobId: string;
      returnvalue: WithdrawSubLixiesJobResult;
      prev?: string;
    },
    id: string
  ) {
    const { senderId, recipientId, mnemonicHash } = args.returnvalue;

    // Build and dispatch notification
    const notif = await this.lixiService.buildNotification(
      NOTIFICATION_TYPES.WITHDRAW_SUB_LIXIES,
      senderId,
      recipientId,
      { name: args?.returnvalue?.name },
      mnemonicHash
    );
    if (notif) {
      const room = mnemonicHash;
      await this.notificationService.saveAndDispatchNotification(room, notif);
    }
  }
}
