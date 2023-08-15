// import { CashReceivedNotificationIcon } from '@bcpros/lixi-components/components/Common/CustomIcons';
import {
  NotificationDto as Notification,
  SocketUser,
} from '@bcpros/lixi-models';
import { currency } from '@components/Common/Ticker';
import {
  all,
  call,
  cancelled,
  fork,
  put,
  select,
  take,
  takeLatest,
} from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { notification } from 'antd';
import { ArgsProps } from 'antd/lib/notification/interface';
import Paragraph from 'antd/lib/typography/Paragraph';
import BigNumber from 'bignumber.js';
import { isMobile } from 'react-device-detect';
import intl from 'react-intl-universal';
import { eventChannel } from 'redux-saga';
import { delay, getContext, race } from 'redux-saga/effects';
import io, { Socket } from 'socket.io-client';
import { downloadExportedLixi, refreshLixiSilent } from '../lixi/actions';
import { hideLoading, showLoading } from '../loading/actions';
import { showToast } from '../toast/actions';
import {
  channelOff,
  channelOn,
  deleteNotification,
  deleteNotificationFailure,
  deleteNotificationSuccess,
  fetchNotifications,
  fetchNotificationsFailure,
  fetchNotificationsSuccess,
  readAllNotifications,
  readAllNotificationsFailure,
  readAllNotificationsSuccess,
  readNotification,
  readNotificationFailure,
  readNotificationSuccess,
  receiveNotification,
  sendXpiNotification,
  serverOff,
  serverOn,
  startChannel,
  stopChannel,
  userOffline,
  userOnline,
  xpiReceivedNotificationWebSocket,
} from './actions';
import notificationApi from './api';
import { setNewPostAvailable } from '@store/post/actions';
import { callConfig } from '@context/shareContext';

const getDeviceNotificationStyle = () => {
  if (isMobile) {
    const notificationStyle = {
      width: '100%',
      marginTop: '10%',
    };
    return notificationStyle;
  }
  if (!isMobile) {
    const notificationStyle = {
      width: '100%',
    };
    return notificationStyle;
  }
};

function* fetchNotificationsSaga(action: PayloadAction<{ accountId: number; mnemonichHash }>) {
  try {
    yield put(showLoading(fetchNotifications.type));
    const { accountId, mnemonichHash } = action.payload;
    const notifications: Notification[] = yield call(
      notificationApi.getByAccountId,
      accountId,
      mnemonichHash
    );
    yield put(fetchNotificationsSuccess(notifications));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('claim.unableClaim');
    yield put(fetchNotificationsFailure(message));
  }
}

function* deleteNotificationSaga(
  action: PayloadAction<{ mnemonichHash; notificationId }>
) {
  try {
    yield put(showLoading(deleteNotification.type));
    const { mnemonichHash, notificationId } = action.payload;
    yield call(
      notificationApi.deleteNofificationById,
      mnemonichHash,
      notificationId
    );
    yield put(deleteNotificationSuccess(notificationId));
  } catch (err) {
    const message =
      (err as Error).message ?? intl.get('notification.unableToDelete');
    yield put(deleteNotificationFailure(message));
  }
}

function* deleteNotificationSuccessSaga(action: PayloadAction<any>) {
  yield put(hideLoading(deleteNotification.type));
}

function* deleteNotificationFailureSaga(action: PayloadAction<any>) {
  const message = action.payload ?? intl.get('notification.unableToDelete');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5,
    })
  );
  yield put(hideLoading(deleteNotification.type));
}

function* readNotificationSaga(
  action: PayloadAction<{ mnemonichHash; notificationId }>
) {
  try {
    yield put(showLoading(readNotification.type));
    const { mnemonichHash, notificationId } = action.payload;
    const data = yield call(
      notificationApi.readByNotificationId,
      mnemonichHash,
      notificationId
    );
    const notification = data as Notification;
    yield put(readNotificationSuccess(notification));
  } catch (err) {
    const message =
      (err as Error).message ?? intl.get('notification.unableToRead');
    yield put(readNotificationFailure(message));
  }
}

function* readNotificationSuccessSaga(action: PayloadAction<Notification>) {
  yield put(hideLoading(readNotification.type));
}

function* readNotificationFailureSaga(action: PayloadAction<Notification>) {
  const message = action.payload ?? intl.get('notification.unableToRead');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5,
    })
  );
  yield put(hideLoading(readNotification.type));
}

function* readAllNotificationsSaga(
  action: PayloadAction<{ accountId; mnemonichHash }>
) {
  try {
    yield put(showLoading(readAllNotifications.type));
    const data = yield call(notificationApi.readAllNotifications);
    const notifications = (data ?? []) as Notification[];
    yield put(
      readAllNotificationsSuccess({
        accountId: action.payload.accountId,
        mnemonichHash: action.payload.mnemonichHash,
        notifications: notifications,
      })
    );
  } catch (err) {
    const message =
      (err as Error).message ?? intl.get('notification.unableToRead');
    yield put(readAllNotificationsFailure(message));
  }
}

function* readAllNotificationsSuccessSaga(
  action: PayloadAction<{ accountId; mnemonichHash; notifications }>
) {
  yield put(
    fetchNotifications({
      accountId: action.payload.accountId,
      mnemonichHash: action.payload.mnemonichHash,
    })
  );
  yield put(hideLoading(readAllNotifications.type));
}

function* readAllNotificationsFailureSaga(action: PayloadAction<Notification>) {
  const message = action.payload ?? intl.get('notification.unableToRead');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5,
    })
  );
  yield put(hideLoading(readAllNotifications.type));
}

function* sendXpiNotificationSaga(action: PayloadAction<string>) {
  const link = action.payload;
  let description = (
    <a href={link} target="_blank" rel="noopener noreferrer">
      <p>Transaction successful. Click to view in block explorer.</p>
    </a>
  );
  yield put(
    showToast('success', {
      message: intl.get('toast.info'),
      description: description,
    })
  );
}

function* xpiReceivedNotificationWebSocketSaga(action: PayloadAction<string>) {
  const xpiAmount = new BigNumber(action.payload);
  let description = (
    <>
      <p>
        {'Lotus received'} {xpiAmount.toLocaleString()} {currency.ticker}{' '}
      </p>
    </>
  );
  yield put(
    showToast('info', {
      message: intl.get('toast.info'),
      description: description,
    })
  );
}

function* userOnlineSaga(action: PayloadAction<SocketUser>) {
  const { payload } = action;
  const socket = callConfig.call.socketContext;
  socket.emit('user_online', payload);
}

function* userOfflineSaga(action: PayloadAction<SocketUser>) {
  const { payload } = action;
  const socket = callConfig.call.socketContext;
  socket.emit('user_offline', payload);
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
  yield takeLatest(
    fetchNotificationsSuccess.type,
    fetchNotificationsSuccessSaga
  );
}

function* watchFetchNotificationsFailure() {
  yield takeLatest(fetchNotificationsFailure.type, fetchNotificationsFailureSaga);
}

function* watchDeleteNotification() {
  yield takeLatest(deleteNotification.type, deleteNotificationSaga);
}

function* watchDeleteNotificationSuccess() {
  yield takeLatest(
    deleteNotificationSuccess.type,
    deleteNotificationSuccessSaga
  );
}

function* watchDeleteNotificationFailure() {
  yield takeLatest(
    deleteNotificationFailure.type,
    deleteNotificationFailureSaga
  );
}

function* watchReadNotification() {
  yield takeLatest(readNotification.type, readNotificationSaga);
}

function* watchReadNotificationSuccess() {
  yield takeLatest(readNotificationSuccess.type, readNotificationSuccessSaga);
}

function* watchReadNotificationFailure() {
  yield takeLatest(readNotificationFailure.type, readNotificationFailureSaga);
}

function* watchReadAllNotifications() {
  yield takeLatest(readAllNotifications.type, readAllNotificationsSaga);
}

function* watchReadAllNotificationsSuccess() {
  yield takeLatest(
    readAllNotificationsSuccess.type,
    readAllNotificationsSuccessSaga
  );
}

function* watchReadAllNotificationsFailure() {
  yield takeLatest(readAllNotificationsFailure.type, readAllNotificationsFailureSaga);
}

function* watchSendXpiNotificationSaga() {
  yield takeLatest(sendXpiNotification.type, sendXpiNotificationSaga);
}

function* watchXpiReceivedNotificationWebSocketSaga() {
  yield takeLatest(
    xpiReceivedNotificationWebSocket.type,
    xpiReceivedNotificationWebSocketSaga
  );
}

function* watchUserOnline() {
  yield takeLatest(userOnline.type, userOnlineSaga);
}

function* watchUserOffline() {
  yield takeLatest(userOffline.type, userOfflineSaga);
}

export default function* notificationSaga() {
  if (typeof window === 'undefined') {
    yield all([
      fork(watchFetchNotifications),
      fork(watchFetchNotificationsSuccess),
      fork(watchFetchNotificationsFailure),
      fork(watchDeleteNotification),
      fork(watchDeleteNotificationSuccess),
      fork(watchDeleteNotificationFailure),
      fork(watchReadNotification),
      fork(watchReadNotificationSuccess),
      fork(watchReadNotificationFailure),
      fork(watchReadAllNotifications),
      fork(watchReadAllNotificationsSuccess),
      fork(watchReadAllNotificationsFailure),
    ]);
  } else {
    yield all([
      fork(watchFetchNotifications),
      fork(watchFetchNotificationsSuccess),
      fork(watchFetchNotificationsFailure),
      fork(watchDeleteNotification),
      fork(watchDeleteNotificationSuccess),
      fork(watchDeleteNotificationFailure),
      fork(watchReadNotification),
      fork(watchReadNotificationSuccess),
      fork(watchReadNotificationFailure),
      fork(watchReadAllNotifications),
      fork(watchReadAllNotificationsSuccess),
      fork(watchReadAllNotificationsFailure),
      fork(watchSendXpiNotificationSaga),
      fork(watchXpiReceivedNotificationWebSocketSaga),
      fork(watchUserOnline),
      fork(watchUserOffline),
    ]);
  }
}
