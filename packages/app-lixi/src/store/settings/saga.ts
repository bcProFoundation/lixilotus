import * as _ from 'lodash';
import intl from 'react-intl-universal';
import { all, fork, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';

import { loadLocale, loadLocaleFailure, loadLocaleSuccess, setInitIntlStatus } from './actions';
import AppLocale from 'src/lang';
import { showToast } from '@store/toast/actions';

function* loadLocaleSaga(action: PayloadAction<string>) {
  try {
    const currentAppLocale = AppLocale[action.payload ?? 'en'];
    intl.init({
      currentLocale: currentAppLocale.locale, // TODO: determine locale here
      locales: {
        [currentAppLocale.locale]: currentAppLocale.messages
      },
    });
    yield put(loadLocaleSuccess());
  } catch {
    yield put(loadLocaleFailure(loadLocale.type));
  }
}

function* loadLocaleSuccessSaga() {
  try {
    yield put(setInitIntlStatus(true));
  } catch (error) {
    const message = `There's an error happens change language.`;
    yield put(loadLocaleFailure(message));
  }
}

function* loadLocaleFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? 'Unable to change language';
  yield put(showToast('error', {
    message: 'Error',
    description: message,
    duration: 5
  }));
}

function* watchLoadLocale() {
  yield takeLatest(loadLocale.type, loadLocaleSaga);
}

function* watchLoadLocaleSuccess() {
  yield takeLatest(loadLocaleSuccess.type, loadLocaleSuccessSaga);
}

function* watchLoadLocaleFailuare() {
  yield takeLatest(loadLocaleFailure.type, loadLocaleFailureSaga);
}


export default function* lixiSaga() {
  yield all([
    fork(watchLoadLocale),
    fork(watchLoadLocaleSuccess),
    fork(watchLoadLocaleFailuare),
  ]);
}