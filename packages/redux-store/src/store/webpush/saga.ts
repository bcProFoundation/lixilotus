import { WebpushSubscribeCommand, WebpushUnsubscribeCommand } from '@bcpros/lixi-models';
import { callConfig } from '@context/shareContext';
import { all, call, fork, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { getAllAccounts } from '@store/account';
import { getWebPushNotifConfig } from '@store/settings/selectors';
import { WalletPathAddressInfo, getAllWalletPaths } from '@store/wallet';
import { buildSubscribeCommand, buildUnsubscribeCommand } from '@utils/pushNotification';
import intl from 'react-intl-universal';
import { select } from 'redux-saga/effects';
import { hideLoading, showLoading } from '../loading/actions';
import { showToast } from '../toast/actions';
import {
  subscribeAll,
  subscribeAllFailure,
  subscribeAllSuccess,
  unsubscribeAll,
  unsubscribeAllFailure,
  unsubscribeAllSuccess,
  unsubscribeByAddresses
} from './actions';
import webpushApi from './api';

function* watchSubscribeAll() {
  yield takeLatest(subscribeAll.type, subscribeAllSaga);
}

function* watchUnsubscribeAll() {
  yield takeLatest(unsubscribeAll.type, unsubscribeAllSaga);
}

function* watchSubscribeAllSuccess() {
  yield takeLatest(subscribeAllSuccess.type, subscribeAllSuccessSaga);
}

function* watchUnsubscribeAllSuccess() {
  yield takeLatest(unsubscribeAllSuccess.type, unsubscribeAllSuccessSaga);
}

function* watchSubscribeAllFailure() {
  yield takeLatest(subscribeAllFailure.type, subscribeAllFailureSaga);
}

function* watchUnsubscribeAllFailure() {
  yield takeLatest(unsubscribeAllFailure.type, unsubscribeAllFailureSaga);
}

function* watchUnsubscribeByAddresses() {
  yield takeLatest(unsubscribeByAddresses.type, unsubscribeByAddressesSaga);
}

function* subscribeAllSaga(action: PayloadAction<{ interactive: boolean; clientAppId: string }>) {
  const { registration } = callConfig.call.serviceWorkerContext;
  const { interactive, clientAppId } = action.payload;

  if (!registration) {
    const message = intl.get('webpush.serviceWorkerNotReady');
    yield put(unsubscribeAllFailure({ interactive: interactive, message: message }));
  }

  try {
    const webpushConfig = yield select(getWebPushNotifConfig);
    const accounts = yield select(getAllAccounts);
    const walletPaths = yield select(getAllWalletPaths);

    const applicationServerKey = process.env.NEXT_PUBLIC_PUBLIC_VAPID_KEY;
    const subscribeOptions = {
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    };
    const pushSubscription = yield call(
      [registration.pushManager, registration.pushManager.subscribe],
      subscribeOptions
    );
    const command = buildSubscribeCommand(pushSubscription, accounts, walletPaths, webpushConfig.deviceId, clientAppId);

    if (interactive) {
      yield put(showLoading(subscribeAll.type));
    }
    const dataApi: WebpushSubscribeCommand = {
      ...command
    };

    yield call(webpushApi.subscribe, dataApi);
    yield put(subscribeAllSuccess({ interactive }));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('webpush.unableToSubscribe');
    yield put(subscribeAllFailure({ interactive: interactive, message: message }));
  }
}

function* unsbuscribeAddressess(registration: ServiceWorkerRegistration, addresses: string[], clientAppId: string) {
  const pushSubscription: PushSubscription = yield call([
    registration.pushManager,
    registration.pushManager.getSubscription
  ]);

  // Select the data
  const webpushConfig = yield select(getWebPushNotifConfig);

  const command = buildUnsubscribeCommand(pushSubscription, addresses, webpushConfig.deviceId, clientAppId);

  const dataApi: WebpushUnsubscribeCommand = {
    ...command
  };

  yield call(webpushApi.unsubscribe, dataApi);
}

function* unsubscribeAllSaga(action: PayloadAction<{ interactive: boolean; clientAppId: string }>) {
  const { registration } = callConfig.call.serviceWorkerContext;
  const { interactive, clientAppId } = action.payload;

  if (!registration) {
    const message = intl.get('webpush.serviceWorkerNotReady');
    yield put(unsubscribeAllFailure({ interactive: interactive, message: message }));
  }

  const walletPaths: WalletPathAddressInfo[] = yield select(getAllWalletPaths);
  const addresses = walletPaths.map(walletPath => walletPath.xAddress);

  try {
    yield unsbuscribeAddressess(registration, addresses, clientAppId);
    yield put(unsubscribeAllSuccess({ interactive }));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('webpush.unableToUnsubscribe');
    yield put(unsubscribeAllFailure({ interactive: interactive, message: message }));
  }
}

function* unsubscribeByAddressesSaga(action: PayloadAction<{ addresses: string[]; clientAppId: string }>) {
  const { registration } = callConfig.call.serviceWorkerContext;
  const { addresses, clientAppId } = action.payload;

  if (!registration) {
    return;
  }
  try {
    yield unsbuscribeAddressess(registration, addresses, clientAppId);
  } catch (err) {
    return;
  }
}

function* subscribeAllSuccessSaga(action: PayloadAction<{ interactive: boolean }>) {
  yield put(hideLoading(subscribeAll.type));
  const { turnOnWebPushNotification } = callConfig.call.serviceWorkerContext;

  // Because we subscribe all of addresses
  // so we should turn on the notification toggle
  yield call(turnOnWebPushNotification);
}

function* subscribeAllFailureSaga(action: PayloadAction<{ interactive: boolean }>) {
  const { interactive } = action.payload;
  yield put(hideLoading(subscribeAll.type));
  const message = action.payload ?? intl.get('webpush.unableToSubscribe');
  const { turnOffWebPushNotification } = callConfig.call.serviceWorkerContext;

  // Otherwise we unsubscribe all of addresses
  // so we should turn off the notification toggle
  yield call(turnOffWebPushNotification);
  if (interactive) {
    yield put(
      showToast('error', {
        message: 'Error',
        description: message,
        duration: 3
      })
    );
  }
}

function* unsubscribeAllSuccessSaga(action: PayloadAction<{ interactive: boolean }>) {
  yield put(hideLoading(unsubscribeAll.type));
  const { turnOffWebPushNotification } = callConfig.call.serviceWorkerContext;
  yield call(turnOffWebPushNotification);
}

function* unsubscribeAllFailureSaga(action: PayloadAction<{ interactive: boolean }>) {
  const { interactive } = action.payload;
  yield put(hideLoading(unsubscribeAll.type));
  const message = action.payload ?? intl.get('webpush.unableToUnsubscribe');
  if (interactive) {
    yield put(
      showToast('error', {
        message: 'Error',
        description: message,
        duration: 3
      })
    );
  }
}

export default function* webpushSaga() {
  yield all([
    fork(watchSubscribeAll),
    fork(watchSubscribeAllSuccess),
    fork(watchSubscribeAllFailure),
    fork(watchUnsubscribeAll),
    fork(watchUnsubscribeAllSuccess),
    fork(watchUnsubscribeAllFailure),
    fork(watchUnsubscribeByAddresses)
  ]);
}
