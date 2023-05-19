import { Account, WebpushSubscribeCommand, WebpushUnsubscribeCommand } from '@bcpros/lixi-models';
import { callConfig } from '@context/shareContext';
import { all, call, fork, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { getAllAccounts, getSelectedAccount } from '@store/account';
import { getWebPushNotifConfig } from '@store/settings/selectors';
import { WalletPathAddressInfo, getAllWalletPaths } from '@store/wallet';
import { buildSubscribeCommand, buildUnsubscribeCommand } from '@utils/pushNotification';
import intl from 'react-intl-universal';
import { select } from 'redux-saga/effects';
import { hideLoading, showLoading } from '../loading/actions';
import { showToast } from '../toast/actions';
import {
  subscribeSelectedAccount,
  subscribeSelectedAccountFailure,
  subscribeSelectedAccountSuccess,
  unsubscribeAll,
  unsubscribeAllFailure,
  unsubscribeAllSuccess,
  unsubscribeByAddresses
} from './actions';
import webpushApi from './api';

function* watchSubscribeSelectedAccount() {
  yield takeLatest(subscribeSelectedAccount.type, subscribeSelectedAccountSaga);
}

function* watchUnsubscribeAll() {
  yield takeLatest(unsubscribeAll.type, unsubscribeAllSaga);
}

function* watchSubscribeSelectedAccountSuccess() {
  yield takeLatest(subscribeSelectedAccountSuccess.type, subscribeSelectedAccountSuccessSaga);
}

function* watchUnsubscribeAllSuccess() {
  yield takeLatest(unsubscribeAllSuccess.type, unsubscribeAllSuccessSaga);
}

function* watchSubscribeSelectedAccountFailure() {
  yield takeLatest(subscribeSelectedAccountFailure.type, subscribeSelectedAccountFailureSaga);
}

function* watchUnsubscribeAllFailure() {
  yield takeLatest(unsubscribeAllFailure.type, unsubscribeAllFailureSaga);
}

function* watchUnsubscribeByAddresses() {
  yield takeLatest(unsubscribeByAddresses.type, unsubscribeByAddressesSaga);
}

function* subscribeSelectedAccountSaga(action: PayloadAction<{ interactive: boolean; clientAppId: string }>) {
  const { registration } = callConfig.call.serviceWorkerContext;
  const { interactive, clientAppId } = action.payload;

  if (!registration) {
    const message = intl.get('webpush.serviceWorkerNotReady');
    yield put(unsubscribeAllFailure({ interactive: interactive, message: message }));
  }

  try {
    const webpushConfig = yield select(getWebPushNotifConfig);
    const account = yield select(getSelectedAccount);
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
    const command = buildSubscribeCommand(pushSubscription, [account], walletPaths, webpushConfig.deviceId, clientAppId);

    if (interactive) {
      yield put(showLoading(subscribeSelectedAccount.type));
    }
    const dataApi: WebpushSubscribeCommand = {
      ...command
    };

    yield call(webpushApi.subscribe, dataApi);
    yield put(subscribeSelectedAccountSuccess({ interactive }));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('webpush.unableToSubscribe');
    yield put(subscribeSelectedAccountFailure({ interactive: interactive, message: message }));
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

  try {
    yield unsbuscribeAddressess(registration, [], clientAppId);
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

function* subscribeSelectedAccountSuccessSaga(action: PayloadAction<{ interactive: boolean }>) {
  yield put(hideLoading(subscribeSelectedAccount.type));
  const { turnOnWebPushNotification } = callConfig.call.serviceWorkerContext;

  // Because we subscribe all of addresses
  // so we should turn on the notification toggle
  yield call(turnOnWebPushNotification);
}

function* subscribeSelectedAccountFailureSaga(action: PayloadAction<{ interactive: boolean }>) {
  const { interactive } = action.payload;
  yield put(hideLoading(subscribeSelectedAccount.type));
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
    fork(watchSubscribeSelectedAccount),
    fork(watchSubscribeSelectedAccountSuccess),
    fork(watchSubscribeSelectedAccountFailure),
    fork(watchUnsubscribeAll),
    fork(watchUnsubscribeAllSuccess),
    fork(watchUnsubscribeAllFailure),
    fork(watchUnsubscribeByAddresses)
  ]);
}
