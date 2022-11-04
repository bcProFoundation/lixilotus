import * as React from 'react';
import { AccountDto as Account, NotificationDto } from '@bcpros/lixi-models';
import { all, call, cancelled, fork, put, select, take, takeLatest } from '@redux-saga/core/effects';
import intl from 'react-intl-universal';
import { PayloadAction } from '@reduxjs/toolkit';
import { getSelectedAccount } from '@store/account/selectors';
import { eventChannel } from 'redux-saga';
import { delay, race } from 'redux-saga/effects';
import io, { Socket } from 'socket.io-client';
import { isMobile } from 'react-device-detect';
import BigNumber from 'bignumber.js';
import { CashReceivedNotificationIcon } from '@bcpros/lixi-components/components/Common/CustomIcons';
import Paragraph from 'antd/lib/typography/Paragraph';
import { currency } from '@components/Common/Ticker';
import { hideLoading, showLoading } from '../loading/actions';
import { showToast } from '../toast/actions';
import {
  channelOff,
  channelOn,
  fetchNotifications,
  fetchNotificationsFailure,
  fetchNotificationsSuccess,
  receiveNotification,
  serverOff,
  serverOn,
  startChannel,
  stopChannel,
  deleteNotification,
  deleteNotificationSuccess,
  deleteNotificationFailure,
  readNotification,
  readNotificationSuccess,
  readNotificationFailure,
  xpiReceivedNotificationWebSocket
} from './actions';
import notificationApi from './api';
import { downloadExportedLixi, refreshLixi, refreshLixiSilent } from '../lixi/actions';
import { notification } from 'antd';
import { ArgsProps } from 'antd/lib/notification';

const getDeviceNotificationStyle = () => {
  if (isMobile) {
    const notificationStyle = {
      width: '100%',
      marginTop: '10%'
    };
    return notificationStyle;
  }
  if (!isMobile) {
    const notificationStyle = {
      width: '100%'
    };
    return notificationStyle;
  }
};

let socket: Socket;
const baseUrl = process.env.NEXT_PUBLIC_LIXI_API ? process.env.NEXT_PUBLIC_LIXI_API : 'https://lixilotus.com/';
const socketServerUrl = `${baseUrl}ws/notifications`;

const NOTIFICATION_TYPES = {
  CREATE_SUB_LIXIES: 1,
  WITHDRAW_SUB_LIXIES: 2,
  EXPORT_SUB_LIXIES: 3
};

/**
 * Wait for the selector until the value existed
 * https://goshacmd.com/detect-state-change-redux-saga/
 * @param selector The selector
 * @returns Finish the generator
 */
function* waitFor(selector) {
  const data = yield select(selector);
  if (data) return data;

  while (true) {
    yield take('*'); // (1a)
    const data = yield select(selector);
    if (data) return data; // (1b)
  }
}

function* fetchNotificationsSaga(action: PayloadAction<{ accountId: number; mnemonichHash }>) {
  try {
    yield put(showLoading(fetchNotifications.type));
    const { accountId, mnemonichHash } = action.payload;
    const notifications: NotificationDto[] = yield call(notificationApi.getByAccountId, accountId, mnemonichHash);
    yield put(fetchNotificationsSuccess(notifications));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('claim.unableClaim');
    yield put(fetchNotificationsFailure(message));
  }
}

function* deleteNotificationSaga(action: PayloadAction<{ mnemonichHash; notificationId }>) {
  try {
    yield put(showLoading(deleteNotification.type));
    const { mnemonichHash, notificationId } = action.payload;
    yield call(notificationApi.deleteNofificationById, mnemonichHash, notificationId);
    yield put(deleteNotificationSuccess(notificationId));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('notification.unableToDelete');
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
      duration: 5
    })
  );
  yield put(hideLoading(deleteNotification.type));
}

function* readNotificationSaga(action: PayloadAction<{ mnemonichHash; notificationId }>) {
  try {
    yield put(showLoading(readNotification.type));
    const { mnemonichHash, notificationId } = action.payload;
    const data = yield call(notificationApi.readByNotificationId, mnemonichHash, notificationId);
    const notification = data as Notification;
    yield put(readNotificationSuccess(notification));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('notification.unableToRead');
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
      duration: 5
    })
  );
  yield put(hideLoading(readNotification.type));
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

function* watchReceiveNotifications() {
  yield takeLatest(receiveNotification.type, receiveNotificationSaga);
}

function* watchDeleteNotification() {
  yield takeLatest(deleteNotification.type, deleteNotificationSaga);
}

function* watchDeleteNotificationSuccess() {
  yield takeLatest(deleteNotificationSuccess.type, deleteNotificationSuccessSaga);
}

function* watchDeleteNotificationFailure() {
  yield takeLatest(deleteNotificationFailure.type, deleteNotificationFailureSaga);
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

function connect(): Promise<Socket> {
  socket = io(socketServerUrl, { transports: ['websocket'] });
  return new Promise(resolve => {
    socket.on('connect', () => {
      resolve(socket);
    });
  });
}

function disconnect() {
  return new Promise(resolve => {
    socket.on('disconnect', () => {
      resolve(socket);
    });
  });
}

function reconnect(): Promise<Socket> {
  return new Promise(resolve => {
    socket.io.on('reconnect', () => {
      resolve(socket);
    });
  });
}

function subscribe(account: Account) {
  socket.emit('subscribe', account.mnemonicHash);
}

function createSocketChannel(socket: Socket) {
  return eventChannel(emit => {
    const handler = (data: Notification) => {
      emit(data);
    };
    socket.on('notification', handler);
    return () => {
      socket.off('notification', handler);
    };
  });
}

function* listenConnectSaga() {
  while (true) {
    yield call(reconnect);
    const account: Account = yield call(waitFor, getSelectedAccount);
    yield call(subscribe, account);
    yield put(serverOn());
  }
}

function* listenDisconnectSaga() {
  while (true) {
    yield call(disconnect);
    yield put(serverOn());
  }
}

function* listenServerSaga() {
  try {
    yield put(channelOn());
    const { timeout } = yield race({
      connected: yield call(connect),
      timeout: yield delay(2000)
    });
    if (timeout) {
      yield put(serverOff());
    }

    const socketChannel = yield call(createSocketChannel, socket);
    yield fork(listenDisconnectSaga);
    yield fork(listenConnectSaga);

    const account: Account = yield call(waitFor, getSelectedAccount);
    yield call(subscribe, account);
    yield put(serverOn());

    while (true) {
      const payload = yield take(socketChannel);
      yield put(receiveNotification(payload));
    }
  } catch (error) {
    console.log('error', error.message);
  } finally {
    if (yield cancelled()) {
      if (socket) {
        socket.disconnect();
      }
      yield put(channelOff());
    }
  }
}

function* startStopChannel() {
  while (true) {
    yield take(startChannel.type);
    yield race([yield call(listenServerSaga), yield take(stopChannel.type)]);
  }
}

function* receiveNotificationSaga(action: PayloadAction<NotificationDto>) {
  try {
    const { notificationTypeId, additionalData } = action.payload;
    if (notificationTypeId == NOTIFICATION_TYPES.CREATE_SUB_LIXIES) {
      const { id } = additionalData as any;
      yield put(refreshLixiSilent(id));
    } else if (notificationTypeId == NOTIFICATION_TYPES.EXPORT_SUB_LIXIES) {
      const { parentId, mnemonicHash, fileName } = additionalData as any;
      yield put(downloadExportedLixi({ lixiId: parentId, mnemonicHash, fileName }));
    }
  } catch (error) {
    console.log('error', error.message);
  }
}

function* xpiReceivedNotificationWebSocketSaga(action: PayloadAction<string>) {
  const xpiAmount = new BigNumber(action.payload);
  const notificationStyle = getDeviceNotificationStyle();
  const config: ArgsProps = {
    message: 'Lotus received',
    description: (
      <>
        <Paragraph>
          + {xpiAmount.toLocaleString()} {currency.ticker}{' '}
        </Paragraph>
      </>
    ),
    duration: 3,
    icon: <CashReceivedNotificationIcon />,
    style: notificationStyle
  };
  notification.success(config);
}

function* watchXpiReceivedNotificationWebSocketSaga() {
  yield takeLatest(xpiReceivedNotificationWebSocket.type, xpiReceivedNotificationWebSocketSaga);
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
      fork(watchReadNotificationFailure)
    ]);
  } else {
    yield all([
      fork(startStopChannel),
      fork(watchFetchNotifications),
      fork(watchFetchNotificationsSuccess),
      fork(watchFetchNotificationsFailure),
      fork(watchReceiveNotifications),
      fork(watchDeleteNotification),
      fork(watchDeleteNotificationSuccess),
      fork(watchDeleteNotificationFailure),
      fork(watchReadNotification),
      fork(watchReadNotificationSuccess),
      fork(watchReadNotificationFailure),
      fork(watchXpiReceivedNotificationWebSocketSaga)
    ]);
  }
}
