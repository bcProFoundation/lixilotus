import { createSelector } from "reselect";
import { RootState } from "../store";
import { notificationsAdapter } from "./reducer";
import { NotificationsState } from "./state";


const {
  selectAll,
  selectEntities,
  selectIds,
  selectTotal
} = notificationsAdapter.getSelectors();

export const getAllNotifications = createSelector(
  (state: RootState) => state.notifications,
  selectAll
);

export const getAllNotificationsEntities = createSelector(
  (state: RootState) => state.notifications,
  selectEntities
);