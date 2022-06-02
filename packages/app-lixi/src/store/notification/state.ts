import { NotificationDto } from "@bcpros/lixi-models/lib/common/notification";
import { EntityState } from "@reduxjs/toolkit";

export interface NotificationsState extends EntityState<NotificationDto> {
  channelStatusOn: boolean;
  serverStatusOn: boolean;
}