import { NotificationDto } from '@bcpros/lixi-models/lib/common/notification';
import { createEntityAdapter, createReducer, Update } from '@reduxjs/toolkit';
import {
  channelOff,
  channelOn,
  deleteNotificationSuccess,
  fetchNotificationsSuccess,
  readNotificationSuccess,
  receiveNotification,
  serverOff,
  serverOn
} from './actions';
import { NotificationsState } from './state';

export const notificationsAdapter = createEntityAdapter<NotificationDto>({
  sortComparer: (a, b) => {
    if (a.createdAt === b.createdAt) {
      return 0;
    } else if (a.createdAt > b.createdAt) {
      return -1;
    } else {
      return 1;
    }
  }
});

const initialState: NotificationsState = notificationsAdapter.getInitialState({
  channelStatusOn: false,
  serverStatusOn: false
});

export const notificationReducer = createReducer(initialState, builder => {
  builder
    .addCase(fetchNotificationsSuccess, (state, action) => {
      const notifications: NotificationDto[] = action.payload;
      notificationsAdapter.setAll(state, notifications);
      state.channelStatusOn = false;
    })
    .addCase(deleteNotificationSuccess, (state, action) => {
      notificationsAdapter.removeOne(state, action.payload);
    })
    .addCase(readNotificationSuccess, (state, action) => {
      const notification = action.payload as NotificationDto;
      const updateNotification: Update<NotificationDto> = {
        id: notification.id,
        changes: {
          readAt: notification.readAt
        }
      };
      notificationsAdapter.updateOne(state, updateNotification);
    })
    .addCase(receiveNotification, (state, action) => {
      const notification = action.payload;
      notificationsAdapter.upsertOne(state, notification);
    })
    .addCase(channelOff, (state, action) => {
      state.channelStatusOn = false;
    })
    .addCase(channelOn, (state, action) => {
      state.channelStatusOn = true;
    })
    .addCase(serverOff, (state, action) => {
      state.serverStatusOn = false;
    })
    .addCase(serverOn, (state, action) => {
      state.serverStatusOn = true;
    });
});
