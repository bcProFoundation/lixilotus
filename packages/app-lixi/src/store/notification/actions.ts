import { createAction } from '@reduxjs/toolkit';
import { NotificationDto as Notification } from '@bcpros/lixi-models';

export const fetchNotifications = createAction<{ accountId: number, mnemonichHash }>('notification/fetchNotifications');
export const fetchNotificationsSuccess = createAction<Notification[]>('notification/fetchNotificationsSuccess');
export const fetchNotificationsFailure = createAction<string>('notification/fetchNotificationsFailure');
export const deleteNotification = createAction<{ mnemonichHash, notificationId }>('notification/deleteNotification');
export const deleteNotificationSuccess = createAction<string>('notification/deleteNotificationSuccess');
export const deleteNotificationFailure = createAction<string>('notification/deleteNotificationFailure');
export const seenNotification = createAction<{ mnemonichHash, notificationId }>('notification/seenNotification');
export const seenNotificationSuccess = createAction<Notification>('notification/seenNotificationSuccess');
export const seenNotificationFailure = createAction<string>('notification/seenNotificationFailure');
export const startChannel = createAction('notification/startChannel');
export const stopChannel = createAction('notification/stopChannel');
export const channelOn = createAction('notification/channelOn');
export const channelOff = createAction('notification/channelOff');
export const serverOn = createAction('notification/serverOn');
export const serverOff = createAction('notification/serverOff');
export const receiveNotification = createAction<Notification>('notification/receiveNotification');
