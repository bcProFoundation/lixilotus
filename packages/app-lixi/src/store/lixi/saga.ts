import { push } from 'connected-next-router';
import * as _ from 'lodash';
import * as Effects from 'redux-saga/effects';
import { Modal } from 'antd';
import { Claim, ClaimDto, PostLixiResponseDto } from '@bcpros/lixi-models';
import {
  CreateLixiCommand, GenerateLixiCommand, LockLixiCommand, UnlockLixiCommand, Lixi, LixiDto,
  WithdrawLixiCommand, RenameLixiCommand
} from '@bcpros/lixi-models/lib/lixi';
import { all, fork, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  generateRandomBase58Str
} from '@utils/encryptionMethods';

import { hideLoading, showLoading } from '../loading/actions';
import claimApi from '../claim/api';
import { showToast } from '../toast/actions';
import {
  generateLixi, getLixi, getLixiFailure, getLixiSuccess,
  lockLixi, lockLixiFailure, lockLixiSuccess, postLixi, postLixiFailure, postLixiSuccess, refreshLixi,
  refreshLixiActionType, refreshLixiFailure, refreshLixiSuccess, selectLixi,
  selectLixiFailure, selectLixiSuccess, setLixi, unlockLixi, unlockLixiFailure,
  unlockLixiSuccess, withdrawLixi, withdrawLixiFailure, withdrawLixiSuccess,renameLixi,renameLixiFailure,renameLixiSuccess, getSubLixi, getSubLixiSuccess
} from './actions';
import lixiApi from './api';

const call: any = Effects.call;
/**
 * Generate a lixi with random encryption password
 * @param action The data to needed generate a lixi
 */
function* generateLixiSaga(action: PayloadAction<GenerateLixiCommand>) {
  const command = action.payload;

  const password = generateRandomBase58Str(8);
  const mnemonic = command.mnemonic;

  const createLixiCommand: CreateLixiCommand = {
    name: command.name,
    accountId: command.accountId,
    maxClaim: Number(command.maxClaim),
    expiryAt: command && command.expiryAt ? new Date(command.expiryAt) : undefined,
    claimType: command.claimType,
    lixiType: command.lixiType,
    minValue: Number(command.minValue),
    maxValue: Number(command.maxValue),
    fixedValue: Number(command.fixedValue),
    dividedValue: Number(command.dividedValue),
    amount: Number(command.amount),
    numberOfSubLixi: Number(command.numberOfSubLixi),
    minStaking: Number(command.minStaking),
    country: command && command.country ? command.country : undefined,
    isFamilyFriendly: command.isFamilyFriendly,
    password: password,
    mnemonic: mnemonic,
    mnemonicHash: command.mnemonicHash,
    envelopeId: command.envelopeId,
    envelopeMessage: command.envelopeMessage ?? ''
  };

  yield put(postLixi(createLixiCommand));

}

/**
 * Saga to get the lixi from api by id
 * @param {id} action The id of the lixi to get.
 */
function* getLixiSaga(action: PayloadAction<number>) {
  try {
    const id = action.payload;
    const data = yield call(lixiApi.getById, id);
    yield put(getLixiSuccess(data));
  } catch (err) {
    const message = (err as Error).message ?? `Could not fetch the lixi from api.`;
    yield put(getLixiFailure(message))
  }
}

function* getLixiFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? 'Unable to get the lixi from server';
  yield put(showToast('error', {
    message: 'Error',
    description: message,
    duration: 5
  }));
}

function* getSubLixiSaga(action: PayloadAction<number>) {
  try {
    const id = action.payload;
    const data = yield call(lixiApi.getSubLixi, id);
    yield put(getSubLixiSuccess(data));
  } catch (err) {
    const message = (err as Error).message ?? `Could not fetch the lixi from api.`;
    yield put(getLixiFailure(message))
  }
}

function* postLixiSaga(action: PayloadAction<CreateLixiCommand>) {
  try {
    const command = action.payload;

    yield put(showLoading(postLixi.type));

    const dataApi: CreateLixiCommand = {
      ...command
    }

    const data: PostLixiResponseDto = yield call(lixiApi.post, dataApi);

    if (_.isNil(data.lixi) || _.isNil(data.lixi.id)) {
      throw new Error('Unable to create the lixi.');
    }

    const lixi = data.lixi;
    yield put(postLixiSuccess(lixi));

  } catch (err) {
    const message = (err as Error).message ?? `Could not post the lixi to the api.`;
    yield put(postLixiFailure(message));
  }
}

function* postLixiSuccessSaga(action: PayloadAction<Lixi>) {

  try {
    const lixi: any = action.payload;

    // Calculate 
    yield put(showToast('success', {
      message: 'Success',
      description: 'Create lixi successfully.',
      duration: 5
    }));
    yield put(setLixi(lixi));
    yield put(hideLoading(postLixi.type));
  } catch (error) {
    const message = `There's an error happens when create new lixi.`;
    yield put(postLixiFailure(message));
  }
}

function* postLixiFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? 'Unable to create lixi on server';
  yield put(showToast('error', {
    message: 'Error',
    description: message,
    duration: 5
  }));
  yield put(hideLoading(postLixi.type));
}

function* refreshLixiSaga(action: PayloadAction<number>) {
  try {
    yield put(showLoading(refreshLixiActionType));
    const lixiId = action.payload;
    const data = yield call(lixiApi.getById, lixiId);
    const lixi = (data as any).lixi as Lixi;
    const children = (data as any).children as Lixi[];
    const claimDtos: ClaimDto[] = yield call(claimApi.getByLixiId, lixiId);
    const claims = (claimDtos ?? []) as Claim[];
    yield put(selectLixiSuccess({ lixi: lixi, children: children, claims: claims }));
  } catch (err) {
    const message = (err as Error).message ?? `Unable to refresh the lixi.`;
    yield put(refreshLixiFailure(message));
  }
}

function* refreshLixiSuccessSaga(action: PayloadAction<{ lixi: Lixi, children: Lixi[], claims: Claim[] }>) {
  yield put(showToast('success', {
    message: 'Success',
    description: 'Refresh the lixi successfully.',
    duration: 5
  }));
  yield put(hideLoading(refreshLixiActionType));
}

function* refreshLixiFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? 'Unable to resfresh the lixi.';
  yield put(showToast('error', {
    message: 'Error',
    description: message,
    duration: 5
  }));
  yield put(hideLoading(refreshLixiActionType));
}

function* setLixiSaga(action: PayloadAction<Lixi>) {
  const lixies: any = action.payload;
  yield put(push('/lixi'));
  yield put(refreshLixi(lixies.lixi.id));
}

function* selectLixiSaga(action: PayloadAction<number>) {
  try {
    yield put(showLoading(refreshLixiActionType));
    const lixiId = action.payload;
    const data: LixiDto = yield call(lixiApi.getById, lixiId);
    const lixi = (data as any).lixi as Lixi;
    const children = (data as any).children as Lixi[];
    const claimDtos: ClaimDto[] = yield call(claimApi.getByLixiId, lixiId);
    const claims = (claimDtos ?? []) as Claim[];
    yield put(selectLixiSuccess({ lixi: lixi, children: children, claims: claims }));
  } catch (err) {
    const message = (err as Error).message ?? `Unable to select the lixi.`;
    yield put(selectLixiFailure(message));
  }
}

function* selectLixiSuccessSaga(action: PayloadAction<Lixi>) {
  const lixies = action.payload;
  yield put(hideLoading(selectLixiSuccess.type));
  yield put(push('/lixi'));
}

function* selectLixiFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? 'Unable to select the lixi.';
  yield put(showToast('error', {
    message: 'Error',
    description: message,
    duration: 5
  }));
  yield put(hideLoading(selectLixi.type));
}

function* unlockLixiSaga(action: PayloadAction<UnlockLixiCommand>) {
  try {
    const command = action.payload;

    const dataApi: UnlockLixiCommand = {
      ...command
    }

    const data = yield call(lixiApi.unlockLixi, command.id, dataApi);
    const lixi = data as Lixi;

    if (_.isNil(data) || _.isNil(data.id)) {
      throw new Error('Unable to unlock the lixi.');
    }
    yield put(unlockLixiSuccess(lixi));
  } catch (error) {
    const message = `There's an error happens when create unlock lixi.`;
    yield put(unlockLixiFailure(message));
  }
}

function* unlockLixiSuccessSaga(action: PayloadAction<Lixi>) {
  yield put(showToast('success', {
    message: 'Success',
    description: 'Unlock lixi successfully.',
    duration: 5
  }));
  yield put(hideLoading(unlockLixiSuccess.type));
}

function* unlockLixiFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? 'Unable to unlock the lixi.';
  yield put(showToast('error', {
    message: 'Error',
    description: message,
    duration: 5
  }));
  yield put(hideLoading(unlockLixiFailure.type));
}

function* lockLixiSaga(action: PayloadAction<LockLixiCommand>) {
  try {
    const command = action.payload;

    const dataApi: LockLixiCommand = {
      ...command
    }

    const data = yield call(lixiApi.lockLixi, command.id, dataApi);
    const lixi = data as Lixi;

    if (_.isNil(data) || _.isNil(data.id)) {
      throw new Error('Unable to lock the lixi.');
    }

    yield put(lockLixiSuccess(lixi));
  } catch (error) {
    const message = `There's an error happens when lock lixi.`;
    yield put(postLixiFailure(message));
  }
}

function* lockLixiSuccessSaga(action: PayloadAction<Lixi>) {
  yield put(showToast('success', {
    message: 'Success',
    description: 'Lock lixi successfully.',
    duration: 5
  }));
  yield put(hideLoading(lockLixiSuccess.type));
}

function* lockLixiFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? 'Unable to lock the lixi.';
  yield put(showToast('error', {
    message: 'Error',
    description: message,
    duration: 5
  }));
  yield put(hideLoading(lockLixiFailure.type));
}

function* withdrawLixiSaga(action: PayloadAction<WithdrawLixiCommand>) {
  try {
    const command = action.payload;

    const dataApi: WithdrawLixiCommand = {
      ...command
    }

    const data = yield call(lixiApi.withdrawLixi, command.id, dataApi);
    const lixi = data as Lixi;

    if (_.isNil(data) || _.isNil(data.id)) {
      throw new Error('Unable to withdraw the lixi.');
    }

    yield put(withdrawLixiSuccess(lixi));
  } catch (error) {
    const message = (error as Error).message ?? `There's an error happens when withdraw lixi.`;
    yield put(withdrawLixiFailure(message));
  }
}

function* withdrawLixiSuccessSaga(action: PayloadAction<Lixi>) {
  yield put(showToast('success', {
    message: 'Success',
    description: 'Withdraw lixi successfully.',
    duration: 5
  }));
  yield put(hideLoading(withdrawLixiSuccess.type));
}

function* withdrawLixiFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? 'Unable to withdraw the lixi.';
  yield put(showToast('error', {
    message: 'Error',
    description: message,
    duration: 5
  }));
  yield put(hideLoading(withdrawLixiFailure.type));
}

function* renameLixiSaga(action: PayloadAction<RenameLixiCommand>) {
  try {
    yield put(showLoading(renameLixi.type));
    const { id } = action.payload;
    const data = yield call(lixiApi.patch, id, action.payload);
    const lixi = data as Lixi;
    yield put(renameLixiSuccess(lixi));
  } catch (err) {
    const message = (err as Error).message ?? `Unable to rename the account.`;
    yield put(renameLixiFailure(message));
  }
}

function* renameLixiSuccessSaga(action: PayloadAction<Lixi>) {
  const lixi = action.payload;
  yield put(hideLoading(renameLixi.type));
  Modal.success({
    content: `Lixi has been renamed to "${lixi.name}"`,
  });
}

function* renameLixiFailureSaga(action: PayloadAction<string>) {
  Modal.error({
    content: 'Rename failed. All lixi must have a unique name.',
  });
  yield put(hideLoading(renameLixi.type));
}

function* watchGenerateLixi() {
  yield takeLatest(generateLixi.type, generateLixiSaga);
}

function* watchGetLixi() {
  yield takeLatest(getLixi.type, getLixiSaga);
}

function* watchGetSubLixi() {
  yield takeLatest(getSubLixi.type, getSubLixiSaga);
}

function* watchGetLixiFailure() {
  yield takeLatest(getLixiFailure.type, getLixiFailureSaga);
}

function* watchPostLixi() {
  yield takeLatest(postLixi.type, postLixiSaga);
}

function* watchPostLixiSuccess() {
  yield takeLatest(postLixiSuccess.type, postLixiSuccessSaga);
}

function* watchPostLixiFailure() {
  yield takeLatest(postLixiFailure.type, postLixiFailureSaga);
}

function* watchSetLixi() {
  yield takeLatest(setLixi.type, setLixiSaga);
}

function* watchSelectLixi() {
  yield takeLatest(selectLixi.type, selectLixiSaga);
}

function* watchSelectLixiSuccess() {
  yield takeLatest(selectLixiSuccess.type, selectLixiSuccessSaga);
}

function* watchSelectLixiFailure() {
  yield takeLatest(selectLixiFailure.type, selectLixiFailureSaga);
}

function* watchRefreshLixi() {
  yield takeLatest(refreshLixi.type, refreshLixiSaga);
}

function* watchRefreshLixiSuccess() {
  yield takeLatest(refreshLixiSuccess.type, refreshLixiSuccessSaga);
}

function* watchRefreshLixiFailure() {
  yield takeLatest(refreshLixiFailure.type, refreshLixiFailureSaga);
}

function* watchLockLixi() {
  yield takeLatest(lockLixi.type, lockLixiSaga);
}

function* watchLockLixiSuccess() {
  yield takeLatest(lockLixiSuccess.type, lockLixiSuccessSaga);
}

function* watchLockLixiFailure() {
  yield takeLatest(lockLixiFailure.type, lockLixiFailureSaga);
}

function* watchUnlockLixi() {
  yield takeLatest(unlockLixi.type, unlockLixiSaga);
}

function* watchUnlockLixiSuccess() {
  yield takeLatest(unlockLixiSuccess.type, unlockLixiSuccessSaga);
}

function* watchUnlockLixiFailure() {
  yield takeLatest(unlockLixiFailure.type, unlockLixiFailureSaga);
}

function* watchWithdrawLixi() {
  yield takeLatest(withdrawLixi.type, withdrawLixiSaga);
}

function* watchWithdrawLixiSuccess() {
  yield takeLatest(withdrawLixiSuccess.type, withdrawLixiSuccessSaga);
}

function* watchWithdrawLixiFailure() {
  yield takeLatest(withdrawLixiFailure.type, withdrawLixiFailureSaga);
}

function* watchRenameLixi() {
  yield takeLatest(renameLixi.type, renameLixiSaga);
}

function* watchRenameLixiSuccess() {
  yield takeLatest(renameLixiSuccess.type, renameLixiSuccessSaga);
}

function* watchRenameLixiFailure() {
  yield takeLatest(renameLixiFailure.type, renameLixiFailureSaga);
}


export default function* lixiSaga() {
  yield all([
    fork(watchGenerateLixi),
    fork(watchGetLixi),
    fork(watchGetLixiFailure),
    fork(watchGetSubLixi),
    fork(watchPostLixi),
    fork(watchPostLixiFailure),
    fork(watchPostLixiSuccess),
    fork(watchSetLixi),
    fork(watchSelectLixi),
    fork(watchSelectLixiSuccess),
    fork(watchSelectLixiFailure),
    fork(watchRefreshLixi),
    fork(watchRefreshLixiSuccess),
    fork(watchRefreshLixiFailure),
    fork(watchLockLixi),
    fork(watchLockLixiSuccess),
    fork(watchLockLixiFailure),
    fork(watchUnlockLixi),
    fork(watchUnlockLixiSuccess),
    fork(watchUnlockLixiFailure),
    fork(watchWithdrawLixi),
    fork(watchWithdrawLixiSuccess),
    fork(watchWithdrawLixiFailure),
    fork(watchRenameLixi),
    fork(watchRenameLixiSuccess),
    fork(watchRenameLixiFailure),
  ]);
}