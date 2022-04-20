import { EntityState } from "@reduxjs/toolkit";
import { NotificationDto as Notification } from "@bcpros/lixi-models";

export interface NotificationsState extends EntityState<Notification> {
}