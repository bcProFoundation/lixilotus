import { NotificationDto as Notification, } from '@bcpros/lixi-models';
import { all, call, fork, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';

import { hideLoading, showLoading } from '../loading/actions';
import {
  fetchNotifications,
  fetchNotificationsFailure,
  fetchNotificationsSuccess,
} from './actions';
import notificationApi from './api';

function* fetchNotificationsSaga(action: PayloadAction<{ accountId: number, mnemonichHash }>) {
  try {
    yield put(showLoading(fetchNotifications.type));
    const { accountId, mnemonichHash } = action.payload;
    const notifications: Notification[] = yield call(notificationApi.getByAccountId, accountId, mnemonichHash);
    yield put(fetchNotificationsSuccess(notifications));
  } catch (err) {
    const message = (err as Error).message ?? `Unable to claim.`;
    yield put(fetchNotificationsFailure(message));
  }
}

function* fetchNotificationsSuccessSaga(action: PayloadAction<Notification[]>) {
  yield put(hideLoading(fetchNotifications.type));
}

function* fetchNotificationsFailureSaga(action: PayloadAction<Notification[]>) {
  yield put(hideLoading(fetchNotifications.type));
}

function* watchFetchNotifications() {
  yield takeLatest(fetchNotifications.type, fetchNotificationsSaga);
}

function* watchFetchNotificationsSuccess() {
  yield takeLatest(fetchNotificationsSuccess.type, fetchNotificationsSuccessSaga);
}

function* watchFetchNotificationsFailure() {
  yield takeLatest(fetchNotificationsFailure.type, fetchNotificationsFailureSaga);
}

export default function* notificationSaga() {
  yield all([
    fork(watchFetchNotifications),
    fork(watchFetchNotificationsSuccess),
    fork(watchFetchNotificationsFailure)
  ]);
}