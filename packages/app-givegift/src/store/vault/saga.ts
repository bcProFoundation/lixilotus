import { PayloadAction } from "@reduxjs/toolkit";
import { notification } from "antd";
import { push } from 'connected-react-router';
import { GenerateVaultDto, Vault, VaultApi } from "@abcpros/givegift-models/lib/vault";
import { all, call, fork, getContext, put, takeLatest } from "@redux-saga/core/effects";
import { generateVault, getVault, getVaultFailure, getVaultSuccess, postVault, postVaultFailure, postVaultSuccess, selectVault, setVault } from "./actions";
import vaultApi from "./api";
import { aesGcmDecrypt, aesGcmEncrypt, generateRandomBase62Str, numberToBase62 } from "@utils/encryptionMethods";

/**
 * Generate a vault with random encryption password
 * @param action The data to needed generate a vault
 */
function* generateVaultSaga(action: PayloadAction<GenerateVaultDto>) {
  const XPI = yield getContext('XPI');
  const vaultDto = action.payload;
  const lang = 'english';
  const Bip39128BitMnemonic = XPI.Mnemonic.generate(128, XPI.Mnemonic.wordLists()[lang]);
  const password = generateRandomBase62Str(8);
  const encryptedMnemonic: string = yield call(aesGcmEncrypt, Bip39128BitMnemonic, password);

  const vault: Vault = {
    id: 0,
    name: vaultDto.name,
    isRandomGive: vaultDto.isRandomGive,
    encryptedMnemonic: encryptedMnemonic,
    minValue: Number(vaultDto.minValue),
    maxValue: Number(vaultDto.maxValue),
    defaultValue: Number(vaultDto.defaultValue),
    redeemCode: password,
    mnemonic: Bip39128BitMnemonic
  };

  yield put(postVault(vault));

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

function* postVaultSaga(action: PayloadAction<Vault>) {
  try {
    const vault = action.payload;

    const dataApi: VaultApi = {
      name: vault.name,
      isRandomGive: vault.isRandomGive,
      encryptedMnemonic: vault.encryptedMnemonic,
      minValue: vault.minValue,
      maxValue: vault.maxValue,
      defaultValue: vault.defaultValue
    }

    const response: { data: VaultApi } = yield call(vaultApi.post, dataApi);

    // Merge back to action payload
    const result = { ...vault, ...response.data } as Vault;
    yield put(postVaultSuccess(result));

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

function* postVaultSuccessSaga(action: PayloadAction<Vault>) {
  const vault = action.payload;
  // Recalculate and valate the redeem code
  const decryptedMnemonic = yield call(aesGcmDecrypt, vault.encryptedMnemonic, vault.redeemCode);
  const encodedId = numberToBase62(vault.id);
  vault.redeemCode = vault.redeemCode + encodedId;
  if (decryptedMnemonic !== vault.mnemonic) {
    const message = `The vault created is invalid.`;
    yield put(postVaultFailure(message));
  } else {
    // calculate vault details
    const Wallet = yield getContext('Wallet');
    const Path10605 = yield call(Wallet.getWalletDetails, vault.mnemonic);
    vault.Path10605 = Path10605;
    yield put(setVault(vault));
  }
}

function* postVaultFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? 'Unable to create vault on server';
  notification.error({
    message: 'Error',
    description: message,
    duration: 5
  });
}

function* setVaultSaga(action: PayloadAction<Vault>) {
  yield put(push('/home'));
}

function* selectVaultSaga(action: PayloadAction<number>) {
  yield put(push('/home'));
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

function* watchSetVault() {
  yield takeLatest(setVault.type, setVaultSaga);
}

function* watchSelectVault() {
  yield takeLatest(selectVault.type, selectVaultSaga);
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
    fork(watchSelectVault)
  ]);
}