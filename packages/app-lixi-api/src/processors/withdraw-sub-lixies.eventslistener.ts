import { OnQueueEvent, QueueEventsHost, QueueEventsListener } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { WITHDRAW_SUB_LIXIES_QUEUE } from "src/constants/lixi.constants";

@Injectable()
@QueueEventsListener(WITHDRAW_SUB_LIXIES_QUEUE)
export class WithdrawSubLixiesEventsListener extends QueueEventsHost {

  @OnQueueEvent('completed')
  completed(args: {
    jobId: string;
    returnvalue: string;
    prev?: string;
  }, id: string) {
    console.log('completed', id);
  }
}