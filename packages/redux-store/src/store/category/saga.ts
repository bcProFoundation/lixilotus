import { all, fork, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { showToast } from '@store/toast/actions';
import intl from 'react-intl-universal';
import * as Effects from 'redux-saga/effects';

import { getCategories, getCategoriesFailure, getCategoriesSuccess } from './actions';
import categoryApi from './api';

const call: any = Effects.call;

function* getCategoriesSaga(action: PayloadAction) {
  console.log('action: ', action.payload);
  try {
    const data = yield call(categoryApi.getCategories);
    yield put(getCategoriesSuccess(data));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('country.unablegetCategories');
    yield put(getCategoriesFailure(message));
  }
}

function* getCategoriesFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('country.unablegetCategories');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
}

function* watchgetCategories() {
  yield takeLatest(getCategories.type, getCategoriesSaga);
}

function* watchgetCategoriesFailure() {
  yield takeLatest(getCategoriesFailure.type, getCategoriesFailureSaga);
}

export default function* categorySaga() {
  yield all([fork(watchgetCategories), fork(watchgetCategoriesFailure)]);
}
