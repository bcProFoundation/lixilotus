import { PayloadAction } from "@reduxjs/toolkit";
import { notification } from "antd";
import { GenerateVaultDto, Vault, VaultApi } from "@abcpros/givegift-models/lib/vault";
import { all, call, fork, getContext, put, takeLatest } from "@redux-saga/core/effects";
import { generateVault, getVault, getVaultFailure, getVaultSuccess, postVault, postVaultFailure, postVaultSuccess, setVault } from "./actions";
import vaultApi from "./api";
import { aesGcmDecrypt, aesGcmEncrypt, generateRandomBase62Str } from "@utils/encryptionMethods";

/**
 * Generate a vault with random encryption password
 * @param action The data to needed generate a vault
 */
function* generateVaultSaga(action: PayloadAction<GenerateVaultDto>) {
  const XPI = yield getContext('XPI');
  const vault = action.payload;
  const lang = 'english';
  const Bip39128BitMnemonic = XPI.Mnemonic.generate(128, XPI.Mnemonic.wordLists()[lang]);
  const password = generateRandomBase62Str(8);
  const encryptedMnemonic: string = yield call(aesGcmEncrypt, Bip39128BitMnemonic, password);

  const vaultApi: VaultApi = {
    name: vault.name,
    isRandomGive: vault.isRandomGive,
    encryptedMnemonic: encryptedMnemonic,
    redeemCode: password,
    minValue: vault.minValue,
    maxValue: vault.maxValue,
    defaultValue: vault.defaultValue
  };

  yield put(postVault(vaultApi));

}

/**
 * Saga to get the vault from api by id
 * @param {id} action The id of the vault to get.
 */
function* getVaultSaga(action: PayloadAction<number>) {
  try {
    const id = action.payload;
    const response = yield call(vaultApi.getById, id);
    yield put(getVaultSuccess(response.data));
  } catch (err) {
    const message = `Could not fetch the vault from api.`;
    yield put(getVaultFailure(message))
  }
}

function* postVaultSaga(action: PayloadAction<VaultApi>) {
  try {
    const data = action.payload;
    const response = yield call(vaultApi.post, data);
    yield put(postVaultSuccess(response.data));

  } catch (err) {
    const message = `Could not post the vault to the api.`;
    yield put(postVaultFailure(message));
  }
}

function* getVaultFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? 'Unable to get the vault from server';
  notification.error({
    message: 'Error',
    description: message,
    duration: 5
  });
}

function* postVaultSuccessSaga(action: PayloadAction<VaultApi>) {
  const vaultApi = action.payload;
  const decryptedMnemonic = yield call(aesGcmDecrypt, vaultApi.encryptedMnemonic, vaultApi.redeemCode);
  console.log(decryptedMnemonic);
  const vault = {
    ...vaultApi,
    id: vaultApi.id,
    mnemonic: decryptedMnemonic,
    minValue: parseFloat(vaultApi.minValue),
    maxValue: parseFloat(vaultApi.maxValue),
    defaultValue: parseFloat(vaultApi.defaultValue)
  } as Vault;
  yield put(setVault(vault));
}

function* postVaultFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? 'Unable to create vault on server';
  notification.error({
    message: 'Error',
    description: message,
    duration: 5
  });
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
  yield takeLatest(getVaultFailure.type, postVaultFailureSaga);
}

export default function* vaultSaga() {
  yield all([
    fork(watchGenerateVault),
    fork(watchGetVault),
    fork(watchGetVaultFailure),
    fork(watchPostVault),
    fork(watchPostVaultFailure),
    fork(watchPostVaultSuccess)
  ]);
}