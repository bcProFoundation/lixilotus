import { createEntityAdapter, createReducer, Update } from "@reduxjs/toolkit"
import { NotificationDto as Notification } from "@bcpros/lixi-models";
import { NotificationsState } from "./state";
import { channelOff, channelOn, fetchNotificationsSuccess, receiveNotification, serverOff, serverOn, deleteNotificationSuccess, readNotificationSuccess } from "./actions";

export const notificationsAdapter = createEntityAdapter<Notification>({
  sortComparer: (a, b) => {
    if (a.createdAt === b.createdAt)  {
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

export const notificationReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchNotificationsSuccess, (state, action) => {
      const notifications = action.payload;
      notificationsAdapter.setAll(state, notifications);
    })
    .addCase(deleteNotificationSuccess, (state, action) => {
      notificationsAdapter.removeOne(state, action.payload);
    })
    .addCase(readNotificationSuccess, (state, action) => {
      const notification = action.payload as Notification;
      const updateNotification: Update<Notification> = {
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
    })
})