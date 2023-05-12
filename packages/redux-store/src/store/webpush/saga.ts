import { WebpushSubscribeCommand, WebpushUnsubscribeCommand } from '@bcpros/lixi-models';
import { all, call, fork, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import intl from 'react-intl-universal';
import { hideLoading, showLoading } from '../loading/actions';
import { showToast } from '../toast/actions';
import { subscribe, subscribeFailure, subscribeSuccess, unsubscribe, unsubscribeFailure, unsubscribeSuccess } from './actions';
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

function* subscribeSaga(action: PayloadAction<{ interactive: boolean, command: WebpushSubscribeCommand }>) {

  const { interactive, command } = action.payload;
  try {

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

function* unsubscribeSaga(action: PayloadAction<{ interactive: boolean, command: WebpushUnsubscribeCommand }>) {

  const { interactive, command } = action.payload;
  try {
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
