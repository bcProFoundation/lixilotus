import { WebpushSubscribeCommand, WebpushUnsubscribeCommand } from '@bcpros/lixi-models';
import { all, fork, takeLatest, call } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { subscribe, unsubscribe } from './actions';
import webpushApi from './api';

function* watchSubscribe() {
  yield takeLatest(subscribe.type, subscribeSaga);
}

function* watchUnsubscribe() {
  yield takeLatest(unsubscribe.type, unsubscribeSaga);
}

function* subscribeSaga(action: PayloadAction<WebpushSubscribeCommand>) {
  try {
    const command = action.payload;
    const dataApi: WebpushSubscribeCommand = {
      ...command
    };

    const count = yield call(webpushApi.subscribe, dataApi);
  } catch (err) {}
}

function* unsubscribeSaga(action: PayloadAction<WebpushUnsubscribeCommand>) {
  try {
    const command = action.payload;
    const dataApi: WebpushUnsubscribeCommand = {
      ...command
    };

    const count = yield call(webpushApi.unsubscribe, dataApi);
  } catch (err) {}
}

export default function* webpushSaga() {
  yield all([fork(watchSubscribe), fork(watchUnsubscribe)]);
}
