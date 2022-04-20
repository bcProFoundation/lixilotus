import { createEntityAdapter, createReducer } from "@reduxjs/toolkit"
import { NotificationDto as Notification } from "@bcpros/lixi-models";
import { NotificationsState } from "./state";
import { fetchNotificationsSuccess } from "./actions";


export const notificationsAdapter = createEntityAdapter<Notification>({
});


const initialState: NotificationsState = notificationsAdapter.getInitialState({
});

export const notificationReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchNotificationsSuccess, (state, action) => {
      const notifications = action.payload;
      notificationsAdapter.setAll(state, notifications);
    })
})