import { AccountDto as Account, NotificationDto as Notification } from '@bcpros/lixi-models';
import { all, call, cancelled, fork, put, select, take, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { getSelectedAccount } from '@store/account/selectors';
import { eventChannel } from 'redux-saga';
import { delay, race } from 'redux-saga/effects';
import io, { Socket } from "socket.io-client";
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
  seenNotification,
  seenNotificationSuccess,
  seenNotificationFailure
} from './actions';
import notificationApi from './api';


let socket: Socket;
const baseUrl = process.env.NEXT_PUBLIC_LIXI_API ? process.env.NEXT_PUBLIC_LIXI_API : 'https://lixilotus.com/';
const socketServerUrl = `${baseUrl}ws/notifications`;


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


function* fetchNotificationsSaga(action: PayloadAction<{ accountId: number, mnemonichHash }>) {
  try {
    yield put(showLoading(fetchNotifications.type));
    const { accountId, mnemonichHash } = action.payload;
    const notifications: Notification[] = yield call(notificationApi.getByAccountId, accountId, mnemonichHash);
    yield put(fetchNotificationsSuccess(notifications));
  } catch (err) {
    const message = (err as Error).message ?? `Unable to fetch.`;
    yield put(fetchNotificationsFailure(message));
  }
}

function* deleteNotificationSaga(action: PayloadAction<{ mnemonichHash, notificationId }>) {
  try {
    yield put(showLoading(deleteNotification.type));
    const { mnemonichHash, notificationId } = action.payload;
    yield call(notificationApi.deleteByNotificationId, mnemonichHash, notificationId);
    yield put(deleteNotificationSuccess(notificationId));
  } catch (err) {
    const message = (err as Error).message ?? `Unable to delete.`;
    yield put(deleteNotificationFailure(message));
  }
}

function* deleteNotificationSuccessSaga(action: PayloadAction<any>) {
  yield put(hideLoading(deleteNotification.type));
}

function* deleteNotificationFailureSaga(action: PayloadAction<any>) {
  const message = action.payload ?? 'Unable to delete the notification.';
  yield put(showToast('error', {
    message: 'Error',
    description: message,
    duration: 5
  }));
  yield put(hideLoading(deleteNotification.type));
}

function* seenNotificationSaga(action: PayloadAction<{ mnemonichHash, notificationId }>) {
  try {
    yield put(showLoading(seenNotification.type));
    const { mnemonichHash, notificationId } = action.payload;
    const data = yield call(notificationApi.seenByNotificationId, mnemonichHash, notificationId);
    const notification = data as Notification;
    yield put(seenNotificationSuccess(notification));
  } catch (err) {
    const message = (err as Error).message ?? `Unable to seen.`;
    yield put(seenNotificationFailure(message));
  }
}

function* seenNotificationSuccessSaga(action: PayloadAction<Notification>) {
  yield put(hideLoading(seenNotification.type));
}

function* seenNotificationFailureSaga(action: PayloadAction<Notification>) {
  const message = action.payload ?? 'Unable to seen the notification.';
  yield put(showToast('error', {
    message: 'Error',
    description: message,
    duration: 5
  }));
  yield put(hideLoading(seenNotification.type));
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

function* watchDeleteNotification() {
  yield takeLatest(deleteNotification.type, deleteNotificationSaga);
}

function* watchDeleteNotificationSuccess() {
  yield takeLatest(deleteNotificationSuccess.type, deleteNotificationSuccessSaga);
}

function* watchDeleteNotificationFailure() {
  yield takeLatest(deleteNotificationFailure.type, deleteNotificationFailureSaga);
}

function* watchSeenNotification() {
  yield takeLatest(seenNotification.type, seenNotificationSaga);
}

function* watchSeenNotificationSuccess() {
  yield takeLatest(seenNotificationSuccess.type, seenNotificationSuccessSaga);
}

function* watchSeenNotificationFailure() {
  yield takeLatest(seenNotificationFailure.type, seenNotificationFailureSaga);
}

function connect(): Promise<Socket> {
  socket = io(socketServerUrl, { transports: ['websocket'] });
  return new Promise((resolve) => {
    socket.on('connect', () => {
      resolve(socket);
    });
  });
};

function disconnect() {
  return new Promise((resolve) => {
    socket.on('disconnect', () => {
      resolve(socket);
    });
  });
};

function reconnect(): Promise<Socket> {
  return new Promise((resolve) => {
    socket.io.on('reconnect', () => {
      resolve(socket);
    });
  });
};

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
      yield put((serverOff()));
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
  }
  finally {
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
    yield race([
      yield call(listenServerSaga),
      yield take(stopChannel.type)
    ]);
  }
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
      fork(watchSeenNotification),
      fork(watchSeenNotificationSuccess),
      fork(watchSeenNotificationFailure)
    ]);
  } else {
    yield all([
      fork(startStopChannel),
      fork(watchFetchNotifications),
      fork(watchFetchNotificationsSuccess),
      fork(watchFetchNotificationsFailure),
      fork(watchDeleteNotification),
      fork(watchDeleteNotificationSuccess),
      fork(watchDeleteNotificationFailure),
      fork(watchSeenNotification),
      fork(watchSeenNotificationSuccess),
      fork(watchSeenNotificationFailure)
    ]);
  }
}