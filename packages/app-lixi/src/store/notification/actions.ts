import { NotificationDto } from '@bcpros/lixi-models';
import { createAction } from '@reduxjs/toolkit';

export const fetchNotifications = createAction<{ accountId: number; mnemonichHash }>('notification/fetchNotifications');
export const fetchNotificationsSuccess = createAction<NotificationDto[]>('notification/fetchNotificationsSuccess');
export const fetchNotificationsFailure = createAction<string>('notification/fetchNotificationsFailure');
export const deleteNotification = createAction<{ mnemonichHash; notificationId }>('notification/deleteNotification');
export const deleteNotificationSuccess = createAction<string>('notification/deleteNotificationSuccess');
export const deleteNotificationFailure = createAction<string>('notification/deleteNotificationFailure');
export const readNotification = createAction<{ mnemonichHash; notificationId }>('notification/readNotification');
export const readNotificationSuccess = createAction<NotificationDto>('notification/readNotificationSuccess');
export const readNotificationFailure = createAction<string>('notification/readNotificationFailure');
export const startChannel = createAction('notification/startChannel');
export const stopChannel = createAction('notification/stopChannel');
export const channelOn = createAction('notification/channelOn');
export const channelOff = createAction('notification/channelOff');
export const serverOn = createAction('notification/serverOn');
export const serverOff = createAction('notification/serverOff');
export const receiveNotification = createAction<NotificationDto>('notification/receiveNotification');

export const sendXpiNotification = createAction<string>('notification/sendXpiNotification');
export const xpiReceivedNotificationWebSocket = createAction<string>('notification/xpiReceivedNotificationWebSocket');

export const readAllNotifications = createAction('notifications/readAllNotifications');
export const readAllNotificationsSuccess = createAction<{ notifications: Notification[] }>(
  'notifications/readAllNotificationsSuccess'
);
export const readAllNotificationsFailure = createAction<string>('notifications/readAllNotificationsFailure');
