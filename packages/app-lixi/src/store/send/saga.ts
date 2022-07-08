import { PayloadAction } from '@reduxjs/toolkit';
import { getAccount } from '@store/account/actions';
import { showToast } from '@store/toast/actions';
import { Modal } from 'antd';
import { all, fork, put, takeLatest } from 'redux-saga/effects';
import { sendXPISuccess } from './actions';

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

function* watchSendXPISuccessSaga() {
  yield takeLatest(sendXPISuccess.type, sendXPISuccessSaga);
}

export default function* sendSaga() {
  yield all([fork(watchSendXPISuccessSaga)]);
}
