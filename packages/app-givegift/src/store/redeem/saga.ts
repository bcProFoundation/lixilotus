import { LOCATION_CHANGE, RouterState } from 'connected-react-router';

import { CreateRedeemDto, Redeem, RedeemDto, ViewRedeemDto } from '@abcpros/givegift-models';
import { all, call, fork, put, select, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';

import { fromSmallestDenomination } from '../../utils/cashMethods';
import { hideLoading, showLoading } from '../loading/actions';
import { showToast } from '../toast/actions';
import {
  postRedeem, postRedeemActionType, postRedeemFailure, postRedeemSuccess, viewRedeem,
  viewRedeemFailure, viewRedeemSuccess
} from './actions';
import redeemApi from './api';

function* postRedeemSuccessSaga(action: PayloadAction<Redeem>) {
  const redeem = action.payload;
  const xpiAmount = redeem && redeem.amount ? fromSmallestDenomination(redeem.amount) : 0;
  const message = `Redeem successfully ${xpiAmount} XPI`;


  yield put(showToast('success', {
    message: 'Redeem Success',
    description: message,
    duration: 8
  }));
  yield put(hideLoading(postRedeemActionType));
}

function* postRedeemFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? 'Unable to redeem';
  yield put(showToast('error', {
    message: 'Error',
    description: message,
    duration: 5
  }));
  yield put(hideLoading(postRedeemActionType));
}

function* postRedeemSaga(action: PayloadAction<Redeem>) {
  try {

    yield put(showLoading(postRedeemActionType));

    const redeem = action.payload;

    const dataApi = redeem as CreateRedeemDto;

    const data: RedeemDto = yield call(redeemApi.post, dataApi);

    // Merge back to action payload
    const result = { ...redeem, ...data } as Redeem;
    yield put(postRedeemSuccess(result));

  } catch (err) {
    const message = (err as Error).message ?? `Unable to redeem.`;
    yield put(postRedeemFailure(message));
  }
}

function* viewRedeemSaga(action: PayloadAction<number>) {
  try {

    yield put(showLoading(viewRedeem.type));

    const redeemId = action.payload;

    const redeem: ViewRedeemDto = yield call(redeemApi.getById, redeemId);

    yield put(viewRedeemSuccess(redeem));

  } catch (err) {
    const message = (err as Error).message ?? `Unable to redeem.`;
    yield put(postRedeemFailure(message));
  }
}

function* viewRedeemSuccessSaga(action: PayloadAction<Redeem>) {
  yield put(hideLoading(viewRedeem.type));
}

function* viewRedeemFailureSaga(action: PayloadAction<string>) {
  yield put(hideLoading(viewRedeem.type));
}

function* watchPostRedeem() {
  yield takeLatest(postRedeem.type, postRedeemSaga);
}

function* watchPostRedeemSuccess() {
  yield takeLatest(postRedeemSuccess.type, postRedeemSuccessSaga);
}

function* watchPostRedeemFailure() {
  yield takeLatest(postRedeemFailure.type, postRedeemFailureSaga);
}

function* watchViewRedeem() {
  yield takeLatest(viewRedeem.type, viewRedeemSaga);
}

function* watchViewRedeemSuccess() {
  yield takeLatest(viewRedeemSuccess.type, viewRedeemSuccessSaga);
}

function* watchViewRedeemFailure() {
  yield takeLatest(viewRedeemFailure.type, viewRedeemFailureSaga);
}

export default function* redeemSaga() {
  yield all([
    fork(watchPostRedeem),
    fork(watchPostRedeemSuccess),
    fork(watchPostRedeemFailure),
    fork(watchViewRedeem),
    fork(watchViewRedeemSuccess),
    fork(watchViewRedeemFailure)
  ]);
}