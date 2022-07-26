import intl from 'react-intl-universal';
import * as Effects from 'redux-saga/effects';

import { all, fork, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { showToast } from '@store/toast/actions';

import {
  getCountry,
  getCountryFailure,
  getCountrySuccess,
  getState,
  getStateFailure,
  getStateSuccess,
  // getCity, 
  // getCityFailure, 
  // getCitySuccess, 
} from './actions';
import countryApi from './api';

const call: any = Effects.call;

function* getCountrySaga(action: PayloadAction) {
  try {
    const data = yield call(countryApi.getCountries);
    yield put(getCountrySuccess(data));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('lixi.couldNotFetchCountry');
    yield put(getCountryFailure(message));
  }
}

function* getCountryFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('lixi.unableGetCountry');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
}

function* getStateSaga(action: PayloadAction<number>) {
  try {
    const id = action.payload;
    console.log("id: ", id)
    const data = yield call(countryApi.getStates, id);
    yield put(getStateSuccess(data));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('lixi.couldNotFetchState');
    yield put(getStateFailure(message));
  }
}

function* getStateFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('lixi.unableGetState');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
}

// function* getCitySaga(action: PayloadAction<number>) {
//   try {
//     const data = yield call(countryApi.getCities);
//     yield put(getCitySuccess(data));
//   } catch (err) {
//     const message = (err as Error).message ?? intl.get('lixi.couldNotFetchCity');
//     yield put(getCityFailure(message));
//   }
// }

// function* getCityFailureSaga(action: PayloadAction<string>) {
//   const message = action.payload ?? intl.get('lixi.unableGetCity');
//   yield put(
//     showToast('error', {
//       message: 'Error',
//       description: message,
//       duration: 5
//     })
//   );
// }

function* watchGetCountry() {
  yield takeLatest(getCountry.type, getCountrySaga);
}

function* watchGetCountryFailure() {
  yield takeLatest(getCountryFailure.type, getCountryFailureSaga);
}

function* watchGetState() {
  yield takeLatest(getState.type, getStateSaga);
}

function* watchGetStateFailure() {
  yield takeLatest(getStateFailure.type, getStateFailureSaga);
}

// function* watchGetCity() {
//   yield takeLatest(getCity.type, getCitySaga);
// }

// function* watchGetCityFailure() {
//   yield takeLatest(getCityFailure.type, getCityFailureSaga);
// }

export default function* countrySaga() {
  yield all([
    fork(watchGetCountry),
    fork(watchGetCountryFailure),
    fork(watchGetState),
    fork(watchGetStateFailure),
    // fork(watchGetCity),
    // fork(watchGetCityFailure),
  ])
};
