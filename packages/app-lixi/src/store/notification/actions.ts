import { createAction } from '@reduxjs/toolkit';
import { NotificationDto as Notification } from '@bcpros/lixi-models';

export const fetchNotifications = createAction<{ accountId: number, mnemonichHash }>('notification/fetchNotifications');
export const fetchNotificationsSuccess = createAction<Notification[]>('notification/fetchNotificationsSuccess');
export const fetchNotificationsFailure = createAction<string>('notification/fetchNotificationsFailure');