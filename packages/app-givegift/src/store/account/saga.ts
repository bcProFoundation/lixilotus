
import { Modal } from 'antd';
import { all, call, fork, getContext, put, takeLatest } from 'redux-saga/effects';

import {
  Account, AccountDto, CreateAccountCommand, ImportAccountCommand, RenameAccountCommand, Vault
} from '@abcpros/givegift-models';
import BCHJS from '@abcpros/xpi-js';
import { PayloadAction } from '@reduxjs/toolkit';
import { aesGcmEncrypt, generateRandomBase62Str } from '@utils/encryptionMethods';

import accountApi from '../account/api';
import { hideLoading, showLoading } from '../loading/actions';
import { showToast } from '../toast/actions';
import vaultApi from '../vault/api';
import {
  generateAccount, getAccount, getAccountFailure, getAccountSuccess, importAccount,
  importAccountFailure, importAccountSuccess, postAccount, postAccountFailure, postAccountSuccess,
  renameAccount, renameAccountFailure, renameAccountSuccess, selectAccount, selectAccountFailure,
  selectAccountSuccess, setAccount
} from './actions';

/**
 * Generate a account with random encryption password
 * @param action The data to needed generate a account
 */
function* generateAccountSaga(action: PayloadAction) {
  const XPI: BCHJS = yield getContext('XPI');
  const lang = 'english';
  const Bip39128BitMnemonic = XPI.Mnemonic.generate(128, XPI.Mnemonic.wordLists()[lang]);

  // Encrypted mnemonic is encrypted by itself
  const encryptedMnemonic: string = yield call(aesGcmEncrypt, Bip39128BitMnemonic, Bip39128BitMnemonic);

  // Hash mnemonic and use it as an id in the database
  const mnemonicUtf8 = new TextEncoder().encode(Bip39128BitMnemonic);              // encode mnemonic as UTF-8
  const mnemonicHashBuffer = yield call([crypto.subtle, crypto.subtle.digest], 'SHA-256', mnemonicUtf8);       // hash the mnemonic
  const mnemonicHash = Buffer.from(new Uint8Array(mnemonicHashBuffer)).toString('hex');

  const name = String(mnemonicHash).substring(0, 5);

  const account: Account = {
    id: 0,
    name,
    mnemonic: Bip39128BitMnemonic,
    encryptedMnemonic,
    mnemonicHash,
  };

  yield put(postAccount(account));
}

function* getAccountSaga(action: PayloadAction<number>) {
  try {
    yield put(showLoading(getAccount.type));
    const id = action.payload;
    const data = yield call(accountApi.getById, id);
    yield put(getAccountSuccess(data));
  } catch (err) {
    const message = (err as Error).message ?? `Could not fetch the account from api.`;
    yield put(getAccountFailure(message));
  }
}

function* getVaultSuccessSaga(action: PayloadAction<Account>) {
  // Hide the loading
  yield put(hideLoading(getAccount.type));
}

function* getAccountFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? 'Unable to get the account from server';
  yield put(showToast('error', {
    message: 'Error',
    description: message,
    duration: 5
  }));
  yield put(hideLoading(getAccount.type));
}

function* postAccountSaga(action: PayloadAction<Account>) {
  try {
    const account = action.payload;

    yield put(showLoading(postAccount.type));

    const dataApi: CreateAccountCommand = {
      name: account.name,
      mnemonicHash: account.mnemonicHash,
      encryptedMnemonic: account.encryptedMnemonic
    }

    const data: AccountDto = yield call(accountApi.post, dataApi);

    // Merge back to action payload
    const result = { ...account, ...data } as Account;
    yield put(postAccountSuccess(result));

  } catch (err) {
    const message = (err as Error).message ?? `Could not post the account to the api.`;
    yield put(postAccountFailure(message));
  }
}

function* postAccountSuccessSaga(action: PayloadAction<Account>) {
  const account = action.payload;
  yield put(showToast('success', {
    message: 'Success',
    description: 'Create account successfully.',
    duration: 5
  }));
  yield put(setAccount(account));
  yield put(hideLoading(postAccount.type));

}

function* postAccountFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? 'Unable to create account on the server.';
  yield put(showToast('error', {
    message: 'Error',
    description: message,
    duration: 5
  }));
  yield put(hideLoading(postAccount.type));
}

function* importAccountSaga(action: PayloadAction<string>) {
  try {
    const mnemonic: string = action.payload;

    // Hash mnemonic and use it as an id in the database
    const mnemonicUtf8 = new TextEncoder().encode(mnemonic);                // encode mnemonic as UTF-8
    const mnemonicHashBuffer = yield call([crypto.subtle, crypto.subtle.digest], 'SHA-256', mnemonicUtf8);       // hash the mnemonic
    const mnemonicHash = Buffer.from(new Uint8Array(mnemonicHashBuffer)).toString('hex');

    const dataApi: ImportAccountCommand = {
      mnemonic,
      mnemonicHash
    };

    const data: AccountDto = yield call(accountApi.import, dataApi);

    // Merge back to action payload
    const result = { ...data } as Account;
    yield put(importAccountSuccess(result));
  } catch (err) {
    const message = (err as Error).message ?? `Could not import the account.`;
    yield put(importAccountFailure(message));
  }
}

function* importAccountSuccessSaga(action: PayloadAction<Account>) {
  const account = action.payload;
  yield put(hideLoading(importAccount.type));
  yield put(setAccount(account));
}

function* importAccountFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? 'Unable to import the account.';
  yield put(showToast('error', {
    message: 'Error',
    description: message,
    duration: 5
  }));
  yield put(hideLoading(importAccount.type));
}

function* selectAccountSaga(action: PayloadAction<number>) {
  try {
    yield put(showLoading(selectAccount.type));
    const accountId = action.payload;
    const data = yield call(accountApi.getById, accountId);
    const account = data as Account;
    const vaultsData = yield call(vaultApi.getByAccountId, accountId);
    const vaults = (vaultsData ?? []) as Vault[];
    yield put(selectAccountSuccess({ account: account, vaults: vaults }));
  } catch (err) {
    const message = (err as Error).message ?? `Unable to select the account.`;
    yield put(selectAccountFailure(message));
  }
}

function* selectAccountSuccessSaga(action: PayloadAction<Account>) {
  yield put(hideLoading(selectAccount.type));
}

function* selectAccountFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? 'Unable to select the account.';
  yield put(showToast('error', {
    message: 'Error',
    description: message,
    duration: 5
  }));
  yield put(hideLoading(selectAccount.type));
}

function* renameAccountSaga(action: PayloadAction<RenameAccountCommand>) {
  try {
    yield put(showLoading(renameAccount.type));
    const { id } = action.payload;
    const data = yield call(accountApi.patch, id, action.payload);
    const account = data as Account;
    yield put(renameAccountSuccess(account));
  } catch (err) {
    const message = (err as Error).message ?? `Unable to rename the account.`;
    yield put(renameAccountFailure(message));
  }
}

function* renameAccountSuccessSaga(action: PayloadAction<Account>) {
  const account = action.payload;
  yield put(hideLoading(renameAccount.type));
  Modal.success({
    content: `Account has renamed to "${account.name}"`,
  });
}

function* renameAccountFailureSaga(action: PayloadAction<string>) {
  Modal.error({
    content: 'Rename failed. All accounts must have a unique name.'
  })
  yield put(hideLoading(importAccount.type));
}

function* watchGenerateAccount() {
  yield takeLatest(generateAccount.type, generateAccountSaga);
}

function* watchGetAccount() {
  yield takeLatest(getAccount.type, getAccountSaga);
}

function* watchGetAccountSuccess() {
  yield takeLatest(getAccountSuccess.type, getVaultSuccessSaga);
}

function* watchGetAccountFailure() {
  yield takeLatest(getAccountFailure.type, getAccountFailureSaga);
}

function* watchPostAccount() {
  yield takeLatest(postAccount.type, postAccountSaga);
}

function* watchPostAccountSuccess() {
  yield takeLatest(postAccountSuccess.type, postAccountSuccessSaga);
}

function* watchPostAccountFailure() {
  yield takeLatest(postAccountFailure.type, postAccountFailureSaga);
}

function* watchImportAccount() {
  yield takeLatest(importAccount.type, importAccountSaga);
}

function* watchImportAccountSuccess() {
  yield takeLatest(importAccountSuccess.type, importAccountSuccessSaga);
}

function* watchImportAccountFailure() {
  yield takeLatest(importAccountFailure.type, importAccountFailureSaga);
}

function* watchSelectAccount() {
  yield takeLatest(selectAccount.type, selectAccountSaga);
}

function* watchSelectAccountSuccess() {
  yield takeLatest(selectAccountSuccess.type, selectAccountSuccessSaga);
}

function* watchSelectAccountFailure() {
  yield takeLatest(selectAccountFailure.type, selectAccountFailureSaga);
}

function* watchRenameAccount() {
  yield takeLatest(renameAccount.type, renameAccountSaga);
}

function* watchRenameAccountSuccess() {
  yield takeLatest(renameAccountSuccess.type, renameAccountSuccessSaga);
}

function* watchRenameAccountFailure() {
  yield takeLatest(renameAccountFailure.type, renameAccountFailureSaga);
}

export default function* accountSaga() {
  yield all([
    fork(watchGenerateAccount),
    fork(watchGetAccount),
    fork(watchGetAccountSuccess),
    fork(watchGetAccountFailure),
    fork(watchPostAccount),
    fork(watchPostAccountSuccess),
    fork(watchPostAccountFailure),
    fork(watchImportAccount),
    fork(watchImportAccountSuccess),
    fork(watchImportAccountFailure),
    fork(watchSelectAccount),
    fork(watchSelectAccountSuccess),
    fork(watchSelectAccountFailure),
    fork(watchRenameAccount),
    fork(watchRenameAccountSuccess),
    fork(watchRenameAccountFailure)
  ]);
}