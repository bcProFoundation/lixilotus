import { all, fork, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { notification } from 'antd';
import { ArgsProps } from 'antd/lib/notification/interface';

import { showToast } from './actions';
import { ToastType } from './state';

function* showToastSaga(action: PayloadAction<{ type: ToastType; config: ArgsProps }>) {
  const { type, config } = action.payload;
  switch (type) {
    case 'success':
      notification.success(config);
      break;
    case 'error':
      notification.error(config);
      break;
    case 'warning':
      notification.warning(config);
      break;
    case 'open':
      notification.open(config);
      break;
    case 'info':
      notification.info(config);
      break;
  }
}

function* watchShowToast() {
  yield takeLatest(showToast.type, showToastSaga);
}

export default function* toastSaga() {
  yield all([fork(watchShowToast)]);
}
