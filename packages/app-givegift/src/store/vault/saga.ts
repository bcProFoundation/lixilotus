import * as _ from 'lodash';
import { PayloadAction } from "@reduxjs/toolkit";
import { push } from 'connected-react-router';
import BCHJS from "@abcpros/xpi-js";
import { CreateVaultCommand, GenerateVaultCommand, LockVaultCommand, UnlockVaultCommand, Vault, VaultDto } from "@abcpros/givegift-models/lib/vault";
import { all, fork, getContext, put, select, takeLatest } from "@redux-saga/core/effects";
import * as Effects from "redux-saga/effects";

const call: any = Effects.call;
import {
  generateVault, getVault, getVaultActionType,
  getVaultFailure, getVaultSuccess, postVault,
  postVaultFailure, postVaultSuccess, refreshVault,
  refreshVaultActionType, refreshVaultFailure,
  refreshVaultSuccess, selectVault, selectVaultSuccess,
  selectVaultFailure, setVault, lockVault, unlockVault, unlockVaultSuccess, lockVaultSuccess, unlockVaultFailure, lockVaultFailure
} from "./actions";
import { aesGcmDecrypt, aesGcmEncrypt, generateRandomBase62Str, numberToBase62 } from "@utils/encryptionMethods";
import { RedeemDto, Redeem } from "@abcpros/givegift-models/lib/redeem";
import vaultApi from "./api";
import redeemApi from "../redeem/api";
import { showToast } from "../toast/actions";
import { hideLoading, showLoading } from "../loading/actions";
import { getSelectedVault } from 'src/store/vault/selectors';

/**
 * Generate a vault with random encryption password
 * @param action The data to needed generate a vault
 */
function* generateVaultSaga(action: PayloadAction<GenerateVaultCommand>) {
  const command = action.payload;

  const password = generateRandomBase62Str(8);
  const mnemonic = command.mnemonic;

  const createVaultCommand: CreateVaultCommand = {
    name: command.name,
    accountId: command.accountId,
    maxRedeem: Number(command.maxRedeem),
    expiryAt: command && command.expiryAt ? new Date(command.expiryAt) : undefined,
    redeemType: command.redeemType,
    vaultType: command.vaultType,
    minValue: Number(command.minValue),
    maxValue: Number(command.maxValue),
    fixedValue: Number(command.fixedValue),
    dividedValue: Number(command.dividedValue),
    amount: Number(command.amount),
    country: command && command.country ? command.country : undefined,
    isFamilyFriendly: command.isFamilyFriendly,
    password: password,
    mnemonic: mnemonic,
    mnemonicHash: command.mnemonicHash
  };

  yield put(postVault(createVaultCommand));

}

/**
 * Saga to get the vault from api by id
 * @param {id} action The id of the vault to get.
 */
function* getVaultSaga(action: PayloadAction<number>) {
  try {
    yield put(showLoading(getVaultActionType));
    const id = action.payload;
    const data = yield call(vaultApi.getById, id);
    yield put(getVaultSuccess(data));
  } catch (err) {
    const message = (err as Error).message ?? `Could not fetch the vault from api.`;
    yield put(getVaultFailure(message))
  }
}

function* postVaultSaga(action: PayloadAction<CreateVaultCommand>) {
  try {
    const command = action.payload;

    yield put(showLoading(postVault.type));

    const dataApi: CreateVaultCommand = {
      ...command
    }

    const data: VaultDto = yield call(vaultApi.post, dataApi);

    if (_.isNil(data) || _.isNil(data.id)) {
      throw new Error('Unable to create the vault.');
    }

    // Calculate the redeem code
    const encodedId = numberToBase62(data.id);
    const redeemPart = yield call(aesGcmDecrypt, data.encryptedRedeemCode, command.mnemonic);
    const redeemCode = redeemPart + encodedId;

    const result = {
      ...data,
      redeemCode: redeemCode,
    } as Vault;
    yield put(postVaultSuccess(result));

  } catch (err) {
    const message = (err as Error).message ?? `Could not post the vault to the api.`;
    yield put(postVaultFailure(message));
  }
}

function* getVaultFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? 'Unable to get the vault from server';
  yield put(showToast('error', {
    message: 'Error',
    description: message,
    duration: 5
  }));
  yield put(hideLoading(getVaultActionType));
}

function* postVaultSuccessSaga(action: PayloadAction<Vault>) {

  try {
    const vault = action.payload;

    // Calculate 
    yield put(showToast('success', {
      message: 'Success',
      description: 'Create vault successfully.',
      duration: 5
    }));
    yield put(setVault(vault));
    yield put(hideLoading(postVault.type));
  } catch (error) {
    const message = `There's an error happens when create new vault.`;
    yield put(postVaultFailure(message));
  }

}

function* postVaultFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? 'Unable to create vault on server';
  yield put(showToast('error', {
    message: 'Error',
    description: message,
    duration: 5
  }));
  yield put(hideLoading(postVault.type));
}

function* refreshVaultSaga(action: PayloadAction<number>) {
  try {
    yield put(showLoading(refreshVaultActionType));
    const vaultId = action.payload;
    const data: VaultDto = yield call(vaultApi.getById, vaultId);
    const vault = data as Vault;
    const redeemDtos: RedeemDto[] = yield call(redeemApi.getByVaultId, vaultId);
    const redeems = (redeemDtos ?? []) as Redeem[];
    yield put(refreshVaultSuccess({ vault: vault, redeems: redeems }));
  } catch (err) {
    const message = (err as Error).message ?? `Unable to refresh the vault.`;
    yield put(refreshVaultFailure(message));
  }
}

function* refreshVaultSuccessSaga(action: PayloadAction<{ vault: Vault, redeems: Redeem[] }>) {
  yield put(showToast('success', {
    message: 'Success',
    description: 'Refresh the vault successfully.',
    duration: 5
  }));
  yield put(hideLoading(refreshVaultActionType));
}

function* refreshVaultFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? 'Unable to resfresh the vault.';
  yield put(showToast('error', {
    message: 'Error',
    description: message,
    duration: 5
  }));
  yield put(hideLoading(refreshVaultActionType));
}

function* setVaultSaga(action: PayloadAction<Vault>) {
  const { id } = action.payload;
  yield put(push('/vault'));
  yield put(refreshVault(id));
}

function* selectVaultSaga(action: PayloadAction<number>) {
  try {
    yield put(showLoading(refreshVaultActionType));
    const vaultId = action.payload;
    const data: VaultDto = yield call(vaultApi.getById, vaultId);
    const vault = data as Vault;
    const redeemDtos: RedeemDto[] = yield call(redeemApi.getByVaultId, vaultId);
    const redeems = (redeemDtos ?? []) as Redeem[];
    yield put(selectVaultSuccess({ vault: vault, redeems: redeems }));
  } catch (err) {
    const message = (err as Error).message ?? `Unable to select the vault.`;
    yield put(selectVaultFailure(message));
  }
}

function* selectVaultSuccessSaga(action: PayloadAction<Vault>) {
  yield put(hideLoading(selectVaultSuccess.type));
  yield put(push('/vault'));
}

function* selectVaultFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? 'Unable to select the vault.';
  yield put(showToast('error', {
    message: 'Error',
    description: message,
    duration: 5
  }));
  yield put(hideLoading(selectVault.type));
}

function* unlockVaultSaga(action: PayloadAction<UnlockVaultCommand>) {
  try {
    const command = action.payload;

    const dataApi: UnlockVaultCommand = {
      ...command
    }

    const data: VaultDto = yield call(vaultApi.unlockVault, command.id, dataApi);
    const vault = data as Vault;
    yield put(unlockVaultSuccess(vault));

    if (_.isNil(data) || _.isNil(data.id)) {
      throw new Error('Unable to unlock the vault.');
    }
  } catch (error) {
    const message = `There's an error happens when create unlock vault.`;
    yield put(unlockVaultFailure(message));
  }
}

function* unlockVaultSuccessSaga(action: PayloadAction<Vault>) {
  yield put(showToast('success', {
    message: 'Success',
    description: 'Unlock vault successfully.',
    duration: 5
  }));
  yield put(hideLoading(unlockVaultSuccess.type));
}

function* unlockVaultFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? 'Unable to unlock the vault.';
  yield put(showToast('error', {
    message: 'Error',
    description: message,
    duration: 5
  }));
  yield put(hideLoading(unlockVaultFailure.type));
}

function* lockVaultSaga(action: PayloadAction<LockVaultCommand>) {
  try {
    const command = action.payload;

    const dataApi: LockVaultCommand = {
      ...command
    }

    const data: VaultDto = yield call(vaultApi.lockVault, command.id, dataApi);
    const vault = data as Vault;
    yield put(lockVaultSuccess(vault));

    if (_.isNil(data) || _.isNil(data.id)) {
      throw new Error('Unable to lock the vault.');
    }
  } catch (error) {
    const message = `There's an error happens when lock vault.`;
    yield put(postVaultFailure(message));
  }
}

function* lockVaultSuccessSaga(action: PayloadAction<Vault>) {
  yield put(showToast('success', {
    message: 'Success',
    description: 'Lock vault successfully.',
    duration: 5
  }));
  yield put(hideLoading(lockVaultSuccess.type));
}

function* lockVaultFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? 'Unable to lock the vault.';
  yield put(showToast('error', {
    message: 'Error',
    description: message,
    duration: 5
  }));
  yield put(hideLoading(lockVaultFailure.type));
}

function* watchGenerateVault() {
  yield takeLatest(generateVault.type, generateVaultSaga);
}

function* watchGetVault() {
  yield takeLatest(getVault.type, getVaultSaga);
}

function* watchGetVaultFailure() {
  yield takeLatest(getVaultFailure.type, getVaultFailureSaga);
}

function* watchPostVault() {
  yield takeLatest(postVault.type, postVaultSaga);
}

function* watchPostVaultSuccess() {
  yield takeLatest(postVaultSuccess.type, postVaultSuccessSaga);
}

function* watchPostVaultFailure() {
  yield takeLatest(postVaultFailure.type, postVaultFailureSaga);
}

function* watchSetVault() {
  yield takeLatest(setVault.type, setVaultSaga);
}

function* watchSelectVault() {
  yield takeLatest(selectVault.type, selectVaultSaga);
}

function* watchSelectVaultSuccess() {
  yield takeLatest(selectVaultSuccess.type, selectVaultSuccessSaga);
}

function* watchSelectVaultFailure() {
  yield takeLatest(selectVaultFailure.type, selectVaultFailureSaga);
}

function* watchRefreshVault() {
  yield takeLatest(refreshVault.type, refreshVaultSaga);
}

function* watchRefreshVaultSuccess() {
  yield takeLatest(refreshVaultSuccess.type, refreshVaultSuccessSaga);
}

function* watchRefreshVaultFailure() {
  yield takeLatest(refreshVaultFailure.type, refreshVaultFailureSaga);
}


function* watchLockVault() {
  yield takeLatest(lockVault.type, lockVaultSaga);
}

function* watchLockVaultSuccess() {
  yield takeLatest(lockVaultSuccess.type, lockVaultSuccessSaga);
}

function* watchLockVaultFailure() {
  yield takeLatest(lockVaultFailure.type, lockVaultFailureSaga);
}

function* watchUnlockVault() {
  yield takeLatest(unlockVault.type, unlockVaultSaga);
}

function* watchUnlockVaultSuccess() {
  yield takeLatest(unlockVaultSuccess.type, unlockVaultSuccessSaga);
}

function* watchUnlockVaultFailure() {
  yield takeLatest(unlockVaultFailure.type, unlockVaultFailureSaga);
}

export default function* vaultSaga() {
  yield all([
    fork(watchGenerateVault),
    fork(watchGetVault),
    fork(watchGetVaultFailure),
    fork(watchPostVault),
    fork(watchPostVaultFailure),
    fork(watchPostVaultSuccess),
    fork(watchSetVault),
    fork(watchSelectVault),
    fork(watchSelectVaultSuccess),
    fork(watchSelectVaultFailure),
    fork(watchRefreshVault),
    fork(watchRefreshVaultSuccess),
    fork(watchRefreshVaultFailure),
    fork(watchLockVault),
    fork(watchLockVaultSuccess),
    fork(watchLockVaultFailure),
    fork(watchUnlockVault),
    fork(watchUnlockVaultSuccess),
    fork(watchUnlockVaultFailure),
  ]);
}