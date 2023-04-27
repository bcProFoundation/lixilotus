// import { CashReceivedNotificationIcon } from '@bcpros/lixi-components/components/Common/CustomIcons';
import { AccountDto as Account, NotificationDto as Notification, PaginationResult } from '@bcpros/lixi-models';
import { currency } from '@components/Common/Ticker';
import { all, call, cancelled, fork, put, select, take, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { getSelectedAccount } from '@store/account/selectors';
import { notification } from 'antd';
import { ArgsProps } from 'antd/lib/notification/interface';
import Paragraph from 'antd/lib/typography/Paragraph';
import BigNumber from 'bignumber.js';
import { isMobile } from 'react-device-detect';
import intl from 'react-intl-universal';
import { eventChannel } from 'redux-saga';
import { delay, race } from 'redux-saga/effects';
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
  xpiReceivedNotificationWebSocket
} from './actions';
import notificationApi from './api';

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
    const notifications: Notification[] = yield call(notificationApi.getByAccountId, accountId, mnemonichHash);
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

function* readAllNotificationsSaga(action: PayloadAction<{ mnemonichHash }>) {
  try {
    yield put(showLoading(readAllNotifications.type));
    const data = yield call(notificationApi.readAllNotifications);
    const notifications = (data ?? []) as Notification[];
    yield put(readAllNotificationsSuccess({ notifications: notifications }));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('notification.unableToRead');
    yield put(readAllNotificationsFailure(message));
  }
}

function* readAllNotificationsSuccessSaga(action: PayloadAction<Notification[]>) {
  yield put(hideLoading(readAllNotifications.type));
}

function* readAllNotificationsFailureSaga(action: PayloadAction<Notification>) {
  const message = action.payload ?? intl.get('notification.unableToRead');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
  yield put(hideLoading(readAllNotifications.type));
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

function* watchReadAllNotifications() {
  yield takeLatest(readAllNotifications.type, readAllNotificationsSaga);
}

function* watchReadAllNotificationsSuccess() {
  yield takeLatest(readAllNotificationsSuccess.type, readAllNotificationsSuccessSaga);
}

function* watchReadAllNotificationsFailure() {
  yield takeLatest(readAllNotificationsFailure.type, readAllNotificationsFailureSaga);
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

function* receiveNotificationSaga(action: PayloadAction<Notification>) {
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

function* sendXpiNotificationSaga(action: PayloadAction<string>) {
  const link = action.payload;
  const notificationStyle = getDeviceNotificationStyle();
  notification.success({
    message: 'Success',
    description: (
      <a href={link} target="_blank" rel="noopener noreferrer">
        <Paragraph>Transaction successful. Click to view in block explorer.</Paragraph>
      </a>
    ),
    duration: currency.notificationDurationShort,
    style: notificationStyle
  });
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
    duration: currency.notificationDurationShort,
    style: notificationStyle
  };
  notification.success(config);
}

function* watchSendXpiNotificationSaga() {
  yield takeLatest(sendXpiNotification.type, sendXpiNotificationSaga);
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
      fork(watchReadNotificationFailure),
      fork(watchReadAllNotifications),
      fork(watchReadAllNotificationsSuccess),
      fork(watchReadAllNotificationsFailure)
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
      fork(watchReadAllNotifications),
      fork(watchReadAllNotificationsSuccess),
      fork(watchReadAllNotificationsFailure),
      fork(watchSendXpiNotificationSaga),
      fork(watchXpiReceivedNotificationWebSocketSaga)
    ]);
  }
}