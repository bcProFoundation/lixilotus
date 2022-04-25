import { OnQueueEvent, QueueEventsHost, QueueEventsListener } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { EXPORT_SUB_LIXIES_QUEUE } from "src/constants/lixi.constants";

@Injectable()
@QueueEventsListener(EXPORT_SUB_LIXIES_QUEUE)
export class ExportSubLixiesEventsListener extends QueueEventsHost {
  @OnQueueEvent('completed')
  completed(args: {
    jobId: string;
    returnvalue: string;
    prev?: string;
  }, id: string) {
    console.log('completed', id);
  }
}