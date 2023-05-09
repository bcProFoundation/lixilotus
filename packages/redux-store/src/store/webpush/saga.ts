import { WebpushSubscribeCommand } from '@bcpros/lixi-models';
import { all, fork, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { subscribe } from './actions';


function* watchsubscribe() {
  yield takeLatest(subscribe.type, subscribeSaga);
}

function* subscribeSaga(action: PayloadAction<WebpushSubscribeCommand>) {
}

export default function* webpushSaga() {
  yield all([
    fork(watchsubscribe)
  ]);
}