export enum NotificationLevel {
  DEBUG,
  INFO,
  WARNING,
  ERROR
}

export interface NotificationTypeDto {
  id?: number;
  name: string;
  description: string;
  template: string;
  createdAt?: Nullable<Date>;
  updatedAt?: Nullable<Date>;
}

export interface NotificationDto {
  id?: string;
  message?: string;
  readAt?: Nullable<Date>;
  deletedAt?: Nullable<Date>;
  additionalData?: Nullable<Object>;
  recipientId?: Nullable<number>;
  senderId?: Nullable<number>;
  notificationType?: Nullable<NotificationTypeDto>;
  notificationTypeId?: Nullable<number>;
  level?: Nullable<number>;
  createdAt?: Nullable<Date>;
  updatedAt?: Nullable<Date>;
  status?: Nullable<string>;
  url?: Nullable<string>;
  action?: Nullable<string>;
}

export interface SendNotificationJobData {
  room: string;
  notification: NotificationDto;
}

