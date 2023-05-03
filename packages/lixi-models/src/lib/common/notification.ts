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
  notificationTypeTranslations?: NotificationTypeTranslationDto[];
  createdAt?: Nullable<Date>;
  updatedAt?: Nullable<Date>;
}

export interface NotificationTypeTranslationDto {
  id?: number;
  notificationTypeId?: Nullable<number>;
  language: string;
  isDefault: string;
  template: string;
  createdAt?: Nullable<Date>;
  updatedAt?: Nullable<Date>;
}

export interface NotificationDto {
  id?: string;
  message?: string;
  readAt?: Nullable<Date>;
  deletedAt?: Nullable<Date>;
  additionalData?: Nullable<any>;
  recipientId?: Nullable<number>;
  senderId?: Nullable<number>;
  notificationType?: Nullable<NotificationTypeDto>;
  notificationTypeId?: Nullable<number>;
  level?: Nullable<string>;
  createdAt?: Nullable<Date>;
  updatedAt?: Nullable<Date>;
  status?: Nullable<string>;
  url?: Nullable<string>;
  action?: Nullable<string>;
}

/**
 * Interface to modeling PushSubscription of web-push
 */

export interface SendNotificationJobData {
  room: string;
  notification: NotificationDto;
}
