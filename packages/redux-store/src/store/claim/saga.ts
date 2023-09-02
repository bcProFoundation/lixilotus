import { Claim, ClaimDto, CreateClaimDto, ViewClaimDto } from '@bcpros/lixi-models';
import { all, call, fork, put, select, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import intl from 'react-intl-universal';

import { fromSmallestDenomination } from '../../utils/cashMethods';
import { hideLoading, showLoading } from '../loading/actions';
import { showToast } from '../toast/actions';

import {
  checkInformationAndClaim,
  checkInformationAndClaimNoAccount,
  postClaim,
  postClaimActionType,
  postClaimFailure,
  postClaimSuccess,
  viewClaim,
  viewClaimFailure,
  viewClaimSuccess
} from './actions';
import claimApi from './api';
import { callConfig } from '@context/index';
import { currency } from '@components/Common/Ticker';
import { take } from 'redux-saga/effects';
import { setAccount } from '@store/account/actions';
import { getCurrentAddress, getCurrentClaimCode } from './selectors';

function* postClaimSuccessSaga(action: PayloadAction<Claim>) {
  const claim = action.payload;
  const xpiAmount = claim && claim.amount ? fromSmallestDenomination(claim.amount) : 0;
  const message = intl.get('claim.claimSuccessAmount', { xpiAmount: xpiAmount });

  yield put(
    showToast('success', {
      message: intl.get('claim.claimSuccess'),
      description: message,
      duration: 8
    })
  );
  yield put(hideLoading(postClaimActionType));
}

function* postClaimFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('claim.unableClaim');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
  yield put(hideLoading(postClaimActionType));
}

function* postClaimSaga(action: PayloadAction<Claim>) {
  try {
    yield put(showLoading(postClaimActionType));

    const claim = action.payload;

    const dataApi = claim as CreateClaimDto;

    const data: ClaimDto = yield call(claimApi.post, dataApi);

    // Merge back to action payload
    const result = { ...claim, ...data } as Claim;
    yield put(postClaimSuccess(result));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('claim.unableClaim');
    yield put(postClaimFailure(message));
  }
}

function* viewClaimSaga(action: PayloadAction<number>) {
  try {
    yield put(showLoading(viewClaim.type));

    const claimId = action.payload;

    const claim: ViewClaimDto = yield call(claimApi.getById, claimId);

    yield put(viewClaimSuccess(claim));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('claim.unableClaim');
    yield put(postClaimFailure(message));
  }
}

function* checkInformationAndClaimSaga(action: PayloadAction<CreateClaimDto>) {
  const Wallet = callConfig.call.walletContext;
  const { XPI } = Wallet;
  const { claimCode: currentClaimCode, claimAddress: currentAddress, captchaToken } = action.payload;

  let claimCode = currentClaimCode;
  if (!currentAddress || !currentClaimCode) {
    return;
  }

  if (currentClaimCode.includes('lixi_')) {
    claimCode = claimCode.match('(?<=lixi_).*')[0];
  }

  // Get the param-free address
  let cleanAddress = currentAddress.split('?')[0];

  const isValidAddress = XPI.Address.isXAddress(cleanAddress);

  if (!isValidAddress) {
    const error = intl.get('claim.titleShared', { ticker: currency.ticker });
    throw new Error(error);
  }

  yield put(
    postClaim({
      claimAddress: cleanAddress,
      claimCode,
      captchaToken
    } as CreateClaimDto)
  );
}

function* checkInformationAndClaimNoAccountSaga(action: PayloadAction<string>) {
  yield take(setAccount.type);
  const currentAddress: string = yield select(getCurrentAddress);
  const currentClaimCode: string = yield select(getCurrentClaimCode);
  const payload = {
    claimAddress: currentAddress,
    claimCode: currentClaimCode,
    captchaToken: action.payload
  };
  yield put(checkInformationAndClaim(payload));
}

function* viewClaimSuccessSaga(action: PayloadAction<Claim>) {
  yield put(hideLoading(viewClaim.type));
}

function* viewClaimFailureSaga(action: PayloadAction<string>) {
  yield put(hideLoading(viewClaim.type));
}

function* watchPostClaim() {
  yield takeLatest(postClaim.type, postClaimSaga);
}

function* watchPostClaimSuccess() {
  yield takeLatest(postClaimSuccess.type, postClaimSuccessSaga);
}

function* watchPostClaimFailure() {
  yield takeLatest(postClaimFailure.type, postClaimFailureSaga);
}

function* watchViewClaim() {
  yield takeLatest(viewClaim.type, viewClaimSaga);
}

function* watchViewClaimSuccess() {
  yield takeLatest(viewClaimSuccess.type, viewClaimSuccessSaga);
}

function* watchViewClaimFailure() {
  yield takeLatest(viewClaimFailure.type, viewClaimFailureSaga);
}

function* watchCheckInformationAndClaim() {
  yield takeLatest(checkInformationAndClaim.type, checkInformationAndClaimSaga);
}

function* watchCheckInformationAndClaimNoAccount() {
  yield takeLatest(checkInformationAndClaimNoAccount.type, checkInformationAndClaimNoAccountSaga);
}

export default function* claimSaga() {
  yield all([
    fork(watchPostClaim),
    fork(watchPostClaimSuccess),
    fork(watchPostClaimFailure),
    fork(watchViewClaim),
    fork(watchViewClaimSuccess),
    fork(watchViewClaimFailure),
    fork(watchCheckInformationAndClaim),
    fork(watchCheckInformationAndClaimNoAccount)
  ]);
}
