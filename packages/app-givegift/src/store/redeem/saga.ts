import { notification } from "antd";
import { all, call, fork, getContext, put, takeLatest } from "@redux-saga/core/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { CreateRedeemDto, Redeem, RedeemDto } from "@abcpros/givegift-models/lib/redeem";
import redeemApi from "./api";
import { postRedeem, postRedeemFailure, postRedeemSuccess } from "./actions";
import { showToast } from "../toast/actions";

function* postRedeemSuccessSaga(action: PayloadAction<Redeem>) {
  const message = 'Redeem successfully'
  yield put(showToast('success', {
    message: 'Redeem Success',
    description: message,
    duration: 5
  }));
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


export default function* vaultSaga() {
  yield all([
    fork(watchPostRedeem),
    fork(watchPostRedeemSuccess),
    fork(watchPostRedeemFailure)
  ]);
}