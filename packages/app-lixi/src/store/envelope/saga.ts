import * as _ from 'lodash';
import intl from 'react-intl-universal';

import { Envelope } from '@bcpros/lixi-models';
import { all, call, fork, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';

import { hideLoading, showLoading } from '../loading/actions';
import { showToast } from '../toast/actions';
import {
  getEnvelope,
  getEnvelopeFailure,
  getEnvelopes,
  getEnvelopesFailure,
  getEnvelopesSuccess,
  getEnvelopeSuccess
} from './actions';
import envelopeApi from './api';

function* getEnvelopeSaga(action: PayloadAction<number>) {
  try {
    yield put(showLoading(getEnvelope.type));
    const id = action.payload;
    const data = yield call(envelopeApi.getById, id);
    yield put(getEnvelopeSuccess(data));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('envelope.couldNotFetch');
    yield put(getEnvelopeFailure(message));
  }
}

function* getEnvelopeSuccessSaga(action: PayloadAction<Envelope>) {
  // Hide the loading
  yield put(hideLoading(getEnvelope.type));
}

function* getEnvelopeFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('envelope.unableGetEnvelope');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
  yield put(hideLoading(getEnvelope.type));
}

function* getEnvelopesSaga(action: PayloadAction) {
  try {
    yield put(showLoading(getEnvelopes.type));
    const data = yield call(envelopeApi.getAll);
    yield put(getEnvelopesSuccess(data));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('envelope.couldNotFetch');
    yield put(getEnvelopeFailure(message));
  }
}

function* getEnvelopesSuccessSaga(action: PayloadAction<Envelope[]>) {
  // Hide the loading
  yield put(hideLoading(getEnvelopes.type));
}

function* getEnvelopesFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('envelope.unableGetEnvelope');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
  yield put(hideLoading(getEnvelopes.type));
}

function* watchGetEnvelope() {
  yield takeLatest(getEnvelope.type, getEnvelopeSaga);
}

function* watchGetEnvelopeSuccess() {
  yield takeLatest(getEnvelopeSuccess.type, getEnvelopeSuccessSaga);
}

function* watchGetEnvelopeFailure() {
  yield takeLatest(getEnvelopeFailure.type, getEnvelopeFailureSaga);
}

function* watchGetEnvelopes() {
  yield takeLatest(getEnvelopes.type, getEnvelopesSaga);
}

function* watchGetEnvelopesSuccess() {
  yield takeLatest(getEnvelopesSuccess.type, getEnvelopesSuccessSaga);
}

function* watchGetEnvelopesFailure() {
  yield takeLatest(getEnvelopesFailure.type, getEnvelopesFailureSaga);
}

export default function* lixiSaga() {
  yield all([
    fork(watchGetEnvelope),
    fork(watchGetEnvelopeSuccess),
    fork(watchGetEnvelopeFailure),
    fork(watchGetEnvelopes),
    fork(watchGetEnvelopesSuccess),
    fork(watchGetEnvelopesFailure)
  ]);
}
