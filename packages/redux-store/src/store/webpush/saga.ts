import { WebpushSubscribeCommand, WebpushUnsubscribeCommand } from '@bcpros/lixi-models';
import { callConfig } from '@context/shareContext';
import { all, call, fork, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { getAllAccounts } from '@store/account';
import { getWebPushNotifConfig } from '@store/settings/selectors';
import { getAllWalletPaths } from '@store/wallet';
import { buildSubscribeCommand, buildUnsubscribeCommand } from '@utils/pushNotification';
import intl from 'react-intl-universal';
import { select } from 'redux-saga/effects';
import { hideLoading, showLoading } from '../loading/actions';
import { showToast } from '../toast/actions';
import {
  subscribe,
  subscribeFailure,
  subscribeSuccess,
  unsubscribe,
  unsubscribeFailure,
  unsubscribeSuccess
} from './actions';
import webpushApi from './api';

function* watchSubscribe() {
  yield takeLatest(subscribe.type, subscribeSaga);
}

function* watchUnsubscribe() {
  yield takeLatest(unsubscribe.type, unsubscribeSaga);
}

function* watchSubscribeSuccess() {
  yield takeLatest(subscribeSuccess.type, subscribeSuccessSaga);
}

function* watchUnsubscribeSuccess() {
  yield takeLatest(unsubscribeSuccess.type, unsubscribeSuccessSaga);
}

function* watchSubscribeFailure() {
  yield takeLatest(subscribeFailure.type, subscribeFailureSaga);
}

function* watchUnsubscribeFailure() {
  yield takeLatest(unsubscribeFailure.type, unsubscribeFailureSaga);
}

function* subscribeSaga(action: PayloadAction<{ interactive: boolean; clientAppId: string }>) {
  const { registration } = callConfig.call.serviceWorkerContext;
  const { interactive, clientAppId } = action.payload;

  if (!registration) {
    const message = intl.get('webpush.serviceWorkerNotReady');
    yield put(unsubscribeFailure({ interactive: interactive, message: message }));
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
    const pushSubscription = yield call(registration.pushManager.subscribe, subscribeOptions);
    const command = buildSubscribeCommand(pushSubscription, accounts, walletPaths, webpushConfig.deviceId, clientAppId);

    if (interactive) {
      yield put(showLoading(subscribe.type));
    }
    const dataApi: WebpushSubscribeCommand = {
      ...command
    };

    yield call(webpushApi.subscribe, dataApi);
    yield put(subscribeSuccess({ interactive }));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('webpush.unableToSubscribe');
    yield put(subscribeFailure({ interactive: interactive, message: message }));
  }
}

function* unsubscribeSaga(action: PayloadAction<{ interactive: boolean; addresses: string[]; clientAppId: string }>) {
  const { registration } = callConfig.call.serviceWorkerContext;
  const { interactive, addresses, clientAppId } = action.payload;

  if (!registration) {
    const message = intl.get('webpush.serviceWorkerNotReady');
    yield put(unsubscribeFailure({ interactive: interactive, message: message }));
  }

  try {
    const subscribeOptions = {
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_PUBLIC_VAPID_KEY
    };
    const pushSubscription: PushSubscription = yield call(registration.pushManager.subscribe, subscribeOptions);

    // Select the data
    const webpushConfig = yield select(getWebPushNotifConfig);

    const command = buildUnsubscribeCommand(pushSubscription, addresses, webpushConfig.deviceId, clientAppId);

    const dataApi: WebpushUnsubscribeCommand = {
      ...command
    };

    yield call(webpushApi.unsubscribe, dataApi);
    yield put(unsubscribeSuccess({ interactive }));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('webpush.unableToUnsubscribe');
    yield put(unsubscribeFailure({ interactive: interactive, message: message }));
  }
}

function* subscribeSuccessSaga(action: PayloadAction<{ interactive: boolean }>) {
  yield put(hideLoading(subscribe.type));
}

function* subscribeFailureSaga(action: PayloadAction<{ interactive: boolean }>) {
  const { interactive } = action.payload;
  yield put(hideLoading(subscribe.type));
  const message = action.payload ?? intl.get('webpush.unableToSubscribe');
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

function* unsubscribeSuccessSaga(action: PayloadAction<{ interactive: boolean }>) {
  yield put(hideLoading(unsubscribe.type));
}

function* unsubscribeFailureSaga(action: PayloadAction<{ interactive: boolean }>) {
  const { interactive } = action.payload;
  yield put(hideLoading(unsubscribe.type));
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
    fork(watchSubscribe),
    fork(watchSubscribeSuccess),
    fork(watchSubscribeFailure),
    fork(watchUnsubscribe),
    fork(watchUnsubscribeSuccess),
    fork(watchUnsubscribeFailure)
  ]);
}
