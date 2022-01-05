import * as _ from 'lodash';
import { PayloadAction } from "@reduxjs/toolkit";
import { push } from 'connected-react-router';
import BCHJS from "@abcpros/xpi-js";
import { CreateVaultCommand, GenerateVaultCommand, ImportVaultCommand, Vault, VaultDto } from "@abcpros/givegift-models/lib/vault";
import { all, call, fork, getContext, put, select, takeLatest } from "@redux-saga/core/effects";
import {
  generateVault, getVault, getVaultActionType,
  getVaultFailure, getVaultSuccess, importVault,
  importVaultActionType, importVaultFailure,
  importVaultSuccess, postVault,
  postVaultFailure, postVaultSuccess, refreshVault,
  refreshVaultActionType, refreshVaultFailure,
  refreshVaultSuccess, selectVault, selectVaultSuccess,
  selectVaultFailure, setVault
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
    vaultType: command.vaultType,
    minValue: Number(command.minValue),
    maxValue: Number(command.maxValue),
    fixedValue: Number(command.fixedValue),
    dividedValue: Number(command.dividedValue),
    country: command && command.country ? command.country : undefined,
    isFamilyFriendly: vaultDto.isFamilyFriendly,
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

    const result = {
      ...data,
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

  // Recalculate and valate the redeem code
  try {

    const vault = action.payload;
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

function* importVaultSaga(action: PayloadAction<ImportVaultCommand>) {
  try {

    yield put(showLoading(importVault.type));

    const ImportVaultCommand = action.payload;

    const data: VaultDto = yield call(vaultApi.import, ImportVaultCommand);

    // Merge back to action payload
    const result = {
      ...data,
      mnemonic: ImportVaultCommand.mnemonic,
      redeemCode: ImportVaultCommand.redeemCode
    } as Vault;

    yield put(importVaultSuccess(result));

  } catch (err) {
    const message = (err as Error).message ?? `Unable to import the vault.`;
    yield put(importVaultFailure(message));
  }
}

function* importVaultSuccessSaga(action: PayloadAction<Vault>) {
  const vault = action.payload;
  yield put(hideLoading(importVault.type));
  yield put(setVault(vault));
}

function* importVaultFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? 'Unable to import the vault.';
  yield put(showToast('error', {
    message: 'Error',
    description: message,
    duration: 5
  }));
  yield put(hideLoading(importVaultActionType));
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

function* watchImportVault() {
  yield takeLatest(importVault.type, importVaultSaga);
}

function* watchImportVaultSuccess() {
  yield takeLatest(importVaultSuccess.type, importVaultSuccessSaga);
}

function* watchImportVaultFailure() {
  yield takeLatest(importVaultFailure.type, importVaultFailureSaga);
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
    fork(watchImportVault),
    fork(watchImportVaultSuccess),
    fork(watchImportVaultFailure),
    fork(watchRefreshVault),
    fork(watchRefreshVaultSuccess),
    fork(watchRefreshVaultFailure)
  ]);
}