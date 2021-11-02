import { PayloadAction } from "@reduxjs/toolkit";
import { notification } from "antd";
import { push } from 'connected-react-router';
import { CreateVaultDto, GenerateVaultDto, ImportVaultDto, Vault, VaultDto } from "@abcpros/givegift-models/lib/vault";
import { all, call, fork, getContext, put, takeLatest } from "@redux-saga/core/effects";
import { generateVault, getVault, getVaultFailure, getVaultSuccess, importVault, importVaultFailure, importVaultSuccess, postVault, postVaultFailure, postVaultSuccess, refreshVault, refreshVaultFailure, refreshVaultSuccess, selectVault, setVault } from "./actions";

import { aesGcmDecrypt, aesGcmEncrypt, generateRandomBase62Str, numberToBase62 } from "@utils/encryptionMethods";
import { RedeemDto, Redeem } from "@abcpros/givegift-models/lib/redeem";
import vaultApi from "./api";
import redeemApi from "../redeem/api";
import { showToast } from "../toast/actions";

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
    fixedValue: Number(vaultDto.fixedValue),
    totalRedeem: 0,
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

    const dataApi: CreateVaultDto = {
      name: vault.name,
      isRandomGive: vault.isRandomGive,
      encryptedMnemonic: vault.encryptedMnemonic,
      minValue: vault.minValue,
      maxValue: vault.maxValue,
      fixedValue: vault.fixedValue
    }

    const response: { data: VaultDto } = yield call(vaultApi.post, dataApi);

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
  try {
    const decryptedMnemonic = yield call(aesGcmDecrypt, vault.encryptedMnemonic, vault.redeemCode);
    const encodedId = numberToBase62(vault.id);
    const redeemCode = vault.redeemCode + encodedId;
    if (decryptedMnemonic !== vault.mnemonic) {
      const message = `The vault created is invalid.`;
      yield put(postVaultFailure(message));
    } else {
      // calculate vault details
      const Wallet = yield getContext('Wallet');
      const Path10605 = yield call(Wallet.getWalletDetails, vault.mnemonic);
      yield put(setVault({
        ...vault,
        redeemCode: redeemCode,
        Path10605: { ...Path10605 }
      }));
      yield put(showToast('success', {
        message: 'Success',
        description: 'Create vault successfully.',
        duration: 5
      }));
    }
  } catch (error) {
    const message = `There's an error happens when create new vault.`;
    yield put(postVaultFailure(message));
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

function* importVaultSaga(action: PayloadAction<ImportVaultDto>) {
  try {
    const importVaultDto = action.payload;

    const response: { data: VaultDto } = yield call(vaultApi.import, importVaultDto);

    // Merge back to action payload
    const result = {
      ...response.data,
      mnemonic: importVaultDto.mnemonic,
      redeemCode: importVaultDto.redeemCode
    } as Vault;
    yield put(importVaultSuccess(result));

  } catch (err) {
    const message = `Unable to import the vault.`;
    yield put(importVaultFailure(message));
  }
}

function* importVaultSuccessSaga(action: PayloadAction<Vault>) {
  const vault = action.payload;
  try {
    // Recalculate and valate the redeem code
    const password = vault.redeemCode.slice(0, 8);
    const decryptedMnemonic = yield call(aesGcmDecrypt, vault.encryptedMnemonic, password);
    if (decryptedMnemonic !== vault.mnemonic) {
      const message = `The vault created is invalid.`;
      yield put(importVaultFailure(message));
    } else {
      // calculate vault details
      const Wallet = yield getContext('Wallet');
      const Path10605 = yield call(Wallet.getWalletDetails, vault.mnemonic);
      yield put(setVault({
        ...vault,
        Path10605: { ...Path10605 }
      }));
      yield put(showToast('success', {
        message: 'Success',
        description: 'Import vault successfully.',
        duration: 5
      }));
    }
  } catch (error) {
    const message = `There's an error happens importing the vault.`;
    yield put(importVaultFailure(message));
  }
}

function* importVaultFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? 'Unable to import the vault.';
  notification.error({
    message: 'Error',
    description: message,
    duration: 5
  });
}

function* refreshVaultSaga(action: PayloadAction<number>) {
  try {
    const vaultId = action.payload;
    const response: { data: VaultDto } = yield call(vaultApi.getById, vaultId);
    const vault = response.data as Vault;
    const redeemResponse: { data: RedeemDto[] } = yield call(redeemApi.getByVaultId, vaultId);
    const redeems = redeemResponse.data as Redeem[];
    yield put(refreshVaultSuccess({ vault: vault, redeems: redeems }))
  } catch (error) {
    const message = 'Unable to refresh the vault.';
    yield put(refreshVaultFailure(message));
  }
}

function* refreshVaultSuccessSaga(action: PayloadAction<{ vault: Vault, redeems: Redeem[] }>) {

  yield put(showToast('success', {
    message: 'Success',
    description: 'Refresh the vault successfully.',
    duration: 5
  }));
}

function* refreshVaultFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? 'Unable to resfresh the vault.';
  notification.error({
    message: 'Error',
    description: message,
    duration: 5
  });
}

function* setVaultSaga(action: PayloadAction<Vault>) {
  const { id } = action.payload;
  yield put(push('/vault'));
  yield put(refreshVault(id));
}

function* selectVaultSaga(action: PayloadAction<number>) {
  const id = action.payload;
  yield put(push('/vault'));
  yield put(refreshVault(id));
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
    fork(watchImportVault),
    fork(watchImportVaultSuccess),
    fork(watchImportVaultFailure),
    fork(watchRefreshVault),
    fork(watchRefreshVaultSuccess),
    fork(watchRefreshVaultFailure)
  ]);
}