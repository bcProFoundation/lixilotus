import { LOCATION_CHANGE, RouterState } from 'connected-react-router';
import { all, call, fork, put, select, takeLatest } from "@redux-saga/core/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { CreateRedeemDto, Redeem, RedeemDto } from "@abcpros/givegift-models/lib/redeem";
import redeemApi from "./api";
import { postRedeem, postRedeemActionType, postRedeemFailure, postRedeemSuccess } from "./actions";
import { showToast } from "../toast/actions";
import { hideLoading, showLoading } from "../loading/actions";
import { fromSmallestDenomination } from "../../utils/cashMethods";


function* postRedeemSuccessSaga(action: PayloadAction<Redeem>) {
  const redeem = action.payload;
  const lotus_amount = fromSmallestDenomination(redeem.amount)
  const message = `Redeem successfully ${lotus_amount} XPI`
  
  
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

function* watchPostRedeem() {
  yield takeLatest(postRedeem.type, postRedeemSaga);
}

function* watchPostRedeemSuccess() {
  yield takeLatest(postRedeemSuccess.type, postRedeemSuccessSaga);
}

function* watchPostRedeemFailure() {
  yield takeLatest(postRedeemFailure.type, postRedeemFailureSaga);
}

export default function* redeemSaga() {
  yield all([
    fork(watchPostRedeem),
    fork(watchPostRedeemSuccess),
    fork(watchPostRedeemFailure),
  ]);
}