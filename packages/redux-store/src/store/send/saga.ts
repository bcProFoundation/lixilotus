import { PayloadAction } from '@reduxjs/toolkit';
import { showToast } from '@store/toast/actions';
import intl from 'react-intl-universal';
import { all, fork, put, takeLatest } from 'redux-saga/effects';

import { sendXPIFailure, sendXPISuccess } from './actions';

function* sendXPISuccessSaga(action: PayloadAction<number>) {
  const selectedAccountId: number = action.payload;
  yield put(
    showToast('success', {
      message: 'Success',
      description: 'Send XPI success',
      duration: 5
    })
  );
}

function* sendXPIFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('send.unableToSend');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 6
    })
  );
}

function* watchSendXPISuccessSaga() {
  yield takeLatest(sendXPISuccess.type, sendXPISuccessSaga);
}

function* watchSendXPIFailureSaga() {
  yield takeLatest(sendXPIFailure.type, sendXPIFailureSaga);
}

export default function* sendSaga() {
  yield all([fork(watchSendXPISuccessSaga)]);
  yield all([fork(watchSendXPIFailureSaga)]);
}
