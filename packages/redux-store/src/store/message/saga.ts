import { all, fork, takeLatest } from '@redux-saga/core/effects';
import {
  userSubcribeToAddressChannel,
  userSubcribeToPageMessageSession,
  userSubcribeToMultiPageMessageSession
} from './actions';
import { PayloadAction } from '@reduxjs/toolkit';
import { callConfig } from '@context/shareContext';

function* userSubcribeToPageMessageSessionSaga(action: PayloadAction<string>) {
  const { payload } = action;
  const socket = callConfig.call.socketContext;
  socket.emit('subscribePageMessageSession', payload);
}

function* userSubcribeToMultiPageMessageSessionSaga(action: PayloadAction<number>) {
  const { payload } = action;
  const socket = callConfig.call.socketContext;
  socket.emit('subscribeMultiPageMessageSession', payload);
}

function* userSubcribeToAddressChannelSaga(action: PayloadAction<string>) {
  const { payload } = action;
  const socket = callConfig.call.socketContext;
  socket.emit('subscribeAddressChannel', payload);
}

function* watchUserSubcribeToPageMessageSession() {
  yield takeLatest(userSubcribeToPageMessageSession.type, userSubcribeToPageMessageSessionSaga);
}

function* watchUserSubcribeToMultiPageMessageSessionSaga() {
  yield takeLatest(userSubcribeToMultiPageMessageSession.type, userSubcribeToMultiPageMessageSessionSaga);
}

function* watchUserSubcribeToAddressChannel() {
  yield takeLatest(userSubcribeToAddressChannel.type, userSubcribeToAddressChannelSaga);
}

export default function* messageSaga() {
  if (typeof window === 'undefined') {
    yield all([]);
  } else {
    yield all([
      fork(watchUserSubcribeToPageMessageSession),
      fork(watchUserSubcribeToMultiPageMessageSessionSaga),
      fork(watchUserSubcribeToAddressChannel)
    ]);
  }
}
