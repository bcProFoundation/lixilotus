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
  readAt?: Nullable<Date>;
  deletedAt?: Nullable<Date>;
  recipientId?: Nullable<number>;
  senderId?: Nullable<number>;
  notificationType?: Nullable<NotificationTypeDto>;
  notificationTypeId?: Nullable<number>;
  level?: Nullable<number>;
  createdAt?: Nullable<Date>;
  updatedAt?: Nullable<Date>;
}

export enum NotificationLevel {
  DEBUG,
  INFO,
  WARNING,
  ERROR
}