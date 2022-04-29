import { OnQueueEvent, QueueEventsHost, QueueEventsListener } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { NotificationGateway } from "src/common/notifications/notification.gateway";
import { CREATE_SUB_LIXIES_QUEUE } from "src/constants/lixi.constants";
import { CreateSubLixiesResult } from "src/models/lixi.models";

@Injectable()
@QueueEventsListener(CREATE_SUB_LIXIES_QUEUE)
export class CreateSubLixiesEventsListener extends QueueEventsHost {

  constructor(
  ) {
    super();
  }

  @OnQueueEvent('completed')
  completed(args: {
    jobId: string;
    returnvalue: CreateSubLixiesResult;
    prev?: string;
  }, id: string) {
  }
}