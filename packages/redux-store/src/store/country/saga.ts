import intl from 'react-intl-universal';
import * as Effects from 'redux-saga/effects';

import { all, fork, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { showToast } from '@store/toast/actions';

import {
  getCountries,
  getCountriesFailure,
  getCountriesSuccess,
  getStates,
  getStatesFailure,
  getStatesSuccess
} from './actions';
import countryApi from './api';

const call: any = Effects.call;

function* getCountriesSaga(action: PayloadAction) {
  try {
    const data = yield call(countryApi.getCountries);
    yield put(getCountriesSuccess(data));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('country.unablegetCountries');
    yield put(getCountriesFailure(message));
  }
}

function* getCountriesFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('country.unablegetCountries');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
}

function* getStatesSaga(action: PayloadAction<number>) {
  try {
    const id = action.payload;
    console.log('id: ', id);
    const data = yield call(countryApi.getStates, id);
    yield put(getStatesSuccess(data));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('country.unableGetState');
    yield put(getStatesFailure(message));
  }
}

function* getStatesFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('country.unableGetState');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
}

function* watchgetCountries() {
  yield takeLatest(getCountries.type, getCountriesSaga);
}

function* watchgetCountriesFailure() {
  yield takeLatest(getCountriesFailure.type, getCountriesFailureSaga);
}

function* watchGetStates() {
  yield takeLatest(getStates.type, getStatesSaga);
}

function* watchGetStatesFailure() {
  yield takeLatest(getStatesFailure.type, getStatesFailureSaga);
}

export default function* countrySaga() {
  yield all([
    fork(watchgetCountries),
    fork(watchgetCountriesFailure),
    fork(watchGetStates),
    fork(watchGetStatesFailure)
  ]);
}
