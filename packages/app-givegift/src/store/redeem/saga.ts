import { notification } from "antd";
import { all, call, fork, getContext, put, takeLatest } from "@redux-saga/core/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { Redeem, RedeemApi } from "@abcpros/givegift-models/lib/redeem";
import redeemApi from "./api";
import { postRedeem, postRedeemFailure, postRedeemSuccess } from "./actions";

function* postRedeemSuccessSaga(action: PayloadAction<Redeem>) {
  const message = 'Redeem successfully'
  notification.success({
    message: 'Redeem Success',
    description: message,
    duration: 5
  });
}

function* postRedeemFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? 'Unable to redeem';
  notification.error({
    message: 'Error',
    description: message,
    duration: 5
  });
}

function* postRedeemSaga(action: PayloadAction<Redeem>) {
  try {
    const redeem = action.payload;

    const dataApi = redeem as RedeemApi;

    const response: { data: RedeemApi } = yield call(redeemApi.post, dataApi);

    // Merge back to action payload
    const result = { ...redeem, ...response.data } as Redeem;
    yield put(postRedeemSuccess(result));

  } catch (err) {
    const message = `Unable to redeem.`;
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


export default function* vaultSaga() {
  yield all([
    fork(watchPostRedeem),
    fork(watchPostRedeemSuccess),
    fork(watchPostRedeemFailure)
  ]);
}