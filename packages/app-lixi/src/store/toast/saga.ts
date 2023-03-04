import { PayloadAction } from '@reduxjs/toolkit';
import { all, fork, takeLatest } from '@redux-saga/core/effects';
import { notification } from 'antd';
import { ArgsProps } from 'antd/lib/notification/interface';
import { ToastType, CustomToastType } from './state';
import { showToast } from './actions';

function* showToastSaga(action: PayloadAction<{ type: ToastType | CustomToastType; config: ArgsProps }>) {
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
    case 'burn':
      notification.open({
        ...config,
        icon: '🔥'
      });
      break;
  }
}

function* watchShowToast() {
  yield takeLatest(showToast.type, showToastSaga);
}

export default function* toastSaga() {
  yield all([fork(watchShowToast)]);
}
