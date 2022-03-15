
import { Modal } from 'antd';
import { all, call, fork, getContext, put, takeLatest } from 'redux-saga/effects';

import {
  Account,
  AccountDto,
  CreateAccountCommand,
  DeleteAccountCommand,
  ImportAccountCommand,
  RenameAccountCommand,
  Lixi,
} from '@bcpros/lixi-models';
import BCHJS from '@bcpros/xpi-js';
import { PayloadAction } from '@reduxjs/toolkit';
import { aesGcmEncrypt, aesGcmDecrypt, numberToBase58 } from '@utils/encryptionMethods';

import accountApi from '../account/api';
import { hideLoading, showLoading } from '../loading/actions';
import { showToast } from '../toast/actions';
import lixiApi from '../lixi/api';
import {
  deleteAccount,
  deleteAccountFailure,
  deleteAccountSuccess,
  generateAccount,
  getAccount,
  getAccountFailure,
  getAccountSuccess,
  importAccount,
  importAccountFailure,
  importAccountSuccess,
  postAccount,
  postAccountFailure,
  postAccountSuccess,
  renameAccount,
  renameAccountFailure,
  renameAccountSuccess,
  selectAccount,
  selectAccountFailure,
  selectAccountSuccess,
  setAccount,
  refreshLixiList,
  refreshLixiListFailure,
  refreshLixiListSuccess,
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
  const encryptedMnemonic: string = yield call(
    aesGcmEncrypt,
    Bip39128BitMnemonic,
    Bip39128BitMnemonic
  );

  // Hash mnemonic and use it as an id in the database
  const mnemonicUtf8 = new TextEncoder().encode(Bip39128BitMnemonic);              // encode mnemonic as UTF-8
  const mnemonicHashBuffer = yield call(
    [crypto.subtle, crypto.subtle.digest],
    'SHA-256',
    mnemonicUtf8
  ); // hash the mnemonic
  const mnemonicHash = Buffer.from(new Uint8Array(mnemonicHashBuffer)).toString('hex');

  const account: CreateAccountCommand = {
    mnemonic: Bip39128BitMnemonic,
    encryptedMnemonic,
    mnemonicHash
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

function* getAccountSuccessSaga(action: PayloadAction<Account>) {
  // Hide the loading
  yield put(setAccount(action.payload));
  yield put(hideLoading(getAccount.type));
}

function* getAccountFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? 'Unable to get the account from server';
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5,
    })
  );
  yield put(hideLoading(getAccount.type));
}

function* postAccountSaga(action: PayloadAction<CreateAccountCommand>) {
  try {
    const command = action.payload;

    yield put(showLoading(postAccount.type));

    const data: AccountDto = yield call(accountApi.post, command);

    // Merge back to action payload
    const result = { ...command, ...data } as Account;
    yield put(postAccountSuccess(result));

  } catch (err) {
    const message = (err as Error).message ?? `Could not post the account to the api.`;
    yield put(postAccountFailure(message));
  }
}

function* postAccountSuccessSaga(action: PayloadAction<Account>) {
  const account = action.payload;
  yield put(
    showToast('success', {
      message: 'Success',
      description: 'Create account successfully.',
      duration: 5,
    })
  );
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
    const mnemonicHashBuffer = yield call(
      [crypto.subtle, crypto.subtle.digest],
      'SHA-256',
      mnemonicUtf8
    ); // hash the mnemonic
    const mnemonicHash = Buffer.from(new Uint8Array(mnemonicHashBuffer)).toString('hex');

    const command: ImportAccountCommand = {
      mnemonic,
      mnemonicHash
    };

    const data: AccountDto = yield call(accountApi.import, command);

    // Merge back to action payload
    const account = { ...data } as Account;

    let lixies: Lixi[] = [];

    try {

      const lixiesData = (yield call(lixiApi.getByAccountId, account.id)) as Lixi[];
      if (lixiesData && lixiesData.length > 0) {
        for (const item of lixiesData) {
          // Calculate the claim code
          const encodedId = numberToBase58(item.id);
          const claimPart = yield call(aesGcmDecrypt, item.encryptedClaimCode, command.mnemonic);
          const lixi: Lixi = {
            ...item,
            claimCode: claimPart + encodedId,
          };
          lixies.push(lixi);
        }
      }
    } catch (err) {
      // The mnemonic is new and currently not existed in the database
    }

    yield put(importAccountSuccess({ account: account, lixies: lixies }));
  } catch (err) {
    const message = (err as Error).message ?? `Could not import the account.`;
    yield put(importAccountFailure(message));
  }
}

function* importAccountSuccessSaga(action: PayloadAction<Account>) {
  const account = action.payload;
  yield put(hideLoading(importAccount.type));
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
    const lixiesData = yield call(lixiApi.getByAccountId, accountId);
    const lixies = (lixiesData ?? []) as Lixi[];
    yield put(selectAccountSuccess({ account: account, lixies: lixies }));
  } catch (err) {
    const message = (err as Error).message ?? `Unable to select the account.`;
    yield put(selectAccountFailure(message));
  }
}

function* selectAccountSuccessSaga(action: PayloadAction<{ account: Account; lixies: Lixi[] }>) {
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
    content: 'Rename failed. All accounts must have a unique name.',
  });
  yield put(hideLoading(renameAccount.type));
}

function* deleteAccountSaga(action: PayloadAction<DeleteAccountCommand>) {
  try {
    yield put(showLoading(deleteAccount.type));
    const { id } = action.payload;
    yield call(accountApi.delete, id, action.payload);
    yield put(deleteAccountSuccess(id));
  } catch (err) {
    const message = (err as Error).message ?? `Unable to delete the account.`;
    yield put(deleteAccountFailure(message));
  }
}

function* deleteAccountSuccessSaga(action: PayloadAction<number>) {
  yield put(hideLoading(deleteAccount.type));
  Modal.success({
    content: `The account has been deleted successfully.`,
  });
}

function* deleteAccountFailureSaga(action: PayloadAction<string>) {
  Modal.error({
    content: 'Delete failed. Could not delete the account.',
  });
  yield put(hideLoading(deleteAccount.type));
}
function* refreshLixiListSaga(action: PayloadAction<number>) {
  try {
    yield put(showLoading(refreshLixiList.type));
    const accountId = action.payload;
    const data = yield call(accountApi.getById, accountId);
    const account = data as Account;
    const lixiesData = yield call(lixiApi.getByAccountId, accountId);
    const lixies = (lixiesData ?? []) as Lixi[];
    yield put(refreshLixiListSuccess({ account: account, lixies: lixies }));
  } catch (err) {
    const message = (err as Error).message ?? `Unable to refresh the list.`;
    yield put(refreshLixiListFailure(message));
  }
}
function* refreshLixiListSuccessSaga(
  action: PayloadAction<{ account: Account; lixies: Lixi[] }>
) {
  yield put(hideLoading(refreshLixiList.type));
}
function* refreshLixiListFailureSaga(action: PayloadAction<number>) {
  const message = action.payload ?? 'Unable to refresh the lixi list.';
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5,
    })
  );
  yield put(hideLoading(refreshLixiList.type));
}

function* watchGenerateAccount() {
  yield takeLatest(generateAccount.type, generateAccountSaga);
}

function* watchGetAccount() {
  yield takeLatest(getAccount.type, getAccountSaga);
}

function* watchGetAccountSuccess() {
  yield takeLatest(getAccountSuccess.type, getAccountSuccessSaga);
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

function* watchDeleteAccount() {
  yield takeLatest(deleteAccount.type, deleteAccountSaga);
}

function* watchDeleteAccountSuccess() {
  yield takeLatest(deleteAccountSuccess.type, deleteAccountSuccessSaga);
}

function* watchDeleteAccountFailure() {
  yield takeLatest(deleteAccountFailure.type, deleteAccountFailureSaga);
}

function* watchRefreshLixiList() {
  yield takeLatest(refreshLixiList.type, refreshLixiListSaga);
}
function* watchRefreshLixiListSuccess() {
  yield takeLatest(refreshLixiListSuccess.type, refreshLixiListSuccessSaga);
}
function* watchRefreshLixiListFailure() {
  yield takeLatest(refreshLixiListFailure.type, refreshLixiListFailureSaga);
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
    fork(watchRefreshLixiList),
    fork(watchRefreshLixiListSuccess),
    fork(watchRefreshLixiListFailure),
    fork(watchRenameAccount),
    fork(watchRenameAccountSuccess),
    fork(watchRenameAccountFailure),
    fork(watchDeleteAccount),
    fork(watchDeleteAccountSuccess),
    fork(watchDeleteAccountFailure)
  ]);
}