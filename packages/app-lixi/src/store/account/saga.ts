import { Modal } from 'antd';
import { all, call, fork, getContext, put, select, takeLatest } from 'redux-saga/effects';
import intl from 'react-intl-universal';

import {
  Account,
  AccountDto,
  CreateAccountCommand,
  DeleteAccountCommand,
  ImportAccountCommand,
  RenameAccountCommand,
  Lixi
} from '@bcpros/lixi-models';
import BCHJS from '@bcpros/xpi-js';
import { PayloadAction } from '@reduxjs/toolkit';
import { aesGcmEncrypt, aesGcmDecrypt, numberToBase58, generateRandomBase58Str } from '@utils/encryptionMethods';

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
  changeAccountLocaleSuccess,
  changeAccountLocaleFailure,
  changeAccountLocale
} from './actions';
import { fetchNotifications } from '@store/notification/actions';
import { getCurrentLocale } from '@store/settings/selectors';

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
  const mnemonicUtf8 = new TextEncoder().encode(Bip39128BitMnemonic); // encode mnemonic as UTF-8
  const mnemonicHashBuffer = yield call([crypto.subtle, crypto.subtle.digest], 'SHA-256', mnemonicUtf8); // hash the mnemonic
  const mnemonicHash = Buffer.from(new Uint8Array(mnemonicHashBuffer)).toString('hex');
  const locale: string | undefined = yield select(getCurrentLocale);

  const account: CreateAccountCommand = {
    mnemonic: Bip39128BitMnemonic,
    encryptedMnemonic,
    mnemonicHash,
    language: locale
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
    const message = (err as Error).message ?? intl.get('account.couldNotFetchAccount');
    yield put(getAccountFailure(message));
  }
}

function* getAccountSuccessSaga(action: PayloadAction<Account>) {
  // Hide the loading
  yield put(setAccount(action.payload));
  yield put(hideLoading(getAccount.type));
}

function* getAccountFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('account.unableGetAccountFromServer');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
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
    const result = {
      ...command,
      ...data
    } as Account;

    yield put(postAccountSuccess(result));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('account.couldNotPostAccount');
    yield put(postAccountFailure(message));
  }
}

function* postAccountSuccessSaga(action: PayloadAction<Account>) {
  const account = action.payload;
  yield put(
    showToast('success', {
      message: 'Success',
      description: intl.get('account.createAccountSuccessful'),
      duration: 5
    })
  );
  yield put(setAccount(account));
  yield put(hideLoading(postAccount.type));
}

function* postAccountFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('account.unableToCreateServer');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
  yield put(hideLoading(postAccount.type));
}

function* importAccountSaga(action: PayloadAction<string>) {
  try {
    const mnemonic: string = action.payload;

    // Hash mnemonic and use it as an id in the database
    const mnemonicUtf8 = new TextEncoder().encode(mnemonic); // encode mnemonic as UTF-8
    const mnemonicHashBuffer = yield call([crypto.subtle, crypto.subtle.digest], 'SHA-256', mnemonicUtf8); // hash the mnemonic
    const mnemonicHash = Buffer.from(new Uint8Array(mnemonicHashBuffer)).toString('hex');

    const locale = yield select(getCurrentLocale);

    const command: ImportAccountCommand = {
      mnemonic,
      mnemonicHash,
      language: locale
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
            claimCode: claimPart + encodedId
          };
          lixies.push(lixi);
        }
      }
    } catch (err) {
      // The mnemonic is new and currently not existed in the database
    }
    account.mnemonic = mnemonic;
    yield put(importAccountSuccess({ account: account, lixies: lixies }));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('account.unableToImport');
    yield put(importAccountFailure(message));
  }
}

function* importAccountSuccessSaga(action: PayloadAction<{ account: Account; lixies: Lixi[] }>) {
  const { account, lixies } = action.payload;
  yield put(
    fetchNotifications({
      accountId: account.id,
      mnemonichHash: account.mnemonicHash
    })
  );
  yield put(
    showToast('success', {
      message: 'Success',
      description: intl.get('account.accountImportSuccess'),
      duration: 5
    })
  );
  yield put(hideLoading(importAccount.type));
}

function* importAccountFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('account.unableToImport');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
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
    const message = (err as Error).message ?? intl.get('account.unableToSelect');
    yield put(selectAccountFailure(message));
  }
}

function* selectAccountSuccessSaga(action: PayloadAction<{ account: Account; lixies: Lixi[] }>) {
  yield put(
    fetchNotifications({
      accountId: action.payload.account.id,
      mnemonichHash: action.payload.account.mnemonicHash
    })
  );
  yield put(hideLoading(selectAccount.type));
}

function* selectAccountFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('account.unableToSelect');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
  yield put(hideLoading(selectAccount.type));
}

function* setAccountSaga(action: PayloadAction<Account>) {
  yield put(
    fetchNotifications({
      accountId: action.payload.id,
      mnemonichHash: action.payload.mnemonicHash
    })
  );
}

function* renameAccountSaga(action: PayloadAction<RenameAccountCommand>) {
  try {
    yield put(showLoading(renameAccount.type));
    const { id } = action.payload;

    const patchAccountCommand: PatchAccountCommand = {
      id: action.payload.id,
      mnemonic: action.payload.mnemonic,
      name: action.payload.name
    };

    const data = yield call(accountApi.patch, id, patchAccountCommand);
    const account = data as Account;
    yield put(renameAccountSuccess(account));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('account.unableToSelect');
    yield put(renameAccountFailure(message));
  }
}

function* renameAccountSuccessSaga(action: PayloadAction<Account>) {
  const account = action.payload;
  yield put(hideLoading(renameAccount.type));
  Modal.success({
    content: intl.get('account.accountRenamedSuccess', { accountName: account.name })
  });
}

function* renameAccountFailureSaga(action: PayloadAction<string>) {
  Modal.error({
    content: intl.get('account.renameFailed')
  });
  yield put(hideLoading(renameAccount.type));
}

function* changeAccountLocaleSaga(action: PayloadAction<ChangeAccountLocaleCommand>) {
  try {
    yield put(showLoading(changeAccountLocale.type));
    const { id } = action.payload;
    const patchAccountCommand: PatchAccountCommand = {
      id: action.payload.id,
      mnemonic: action.payload.mnemonic,
      language: action.payload.language
    };

    const data = yield call(accountApi.patch, id, patchAccountCommand);
    const account = data as Account;
    yield put(changeAccountLocaleSuccess(account));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('account.unableToChangeLocaleAccount');
    yield put(changeAccountLocaleFailure(message));
  }
}

function* changeAccountLocaleSuccessSaga(action: PayloadAction<Account>) {
  const account = action.payload;
  yield put(hideLoading(changeAccountLocale.type));
  const languageName: string = intl.get(account.language);
  Modal.success({
    content: intl.get('account.accountChangeLocaleSuccess', { language: languageName })
  });
}

function* changeAccountLocaleFailureSaga(action: PayloadAction<string>) {
  Modal.error({
    content: intl.get('account.unableToChangeLocaleAccount')
  });
  yield put(hideLoading(changeAccountLocale.type));
}

function* deleteAccountSaga(action: PayloadAction<DeleteAccountCommand>) {
  try {
    yield put(showLoading(deleteAccount.type));
    const { id } = action.payload;
    yield call(accountApi.delete, id, action.payload);
    yield put(deleteAccountSuccess(id));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('account.deleteFailed');
    yield put(deleteAccountFailure(message));
  }
}

function* deleteAccountSuccessSaga(action: PayloadAction<number>) {
  yield put(hideLoading(deleteAccount.type));
  Modal.success({
    content: intl.get('account.accountDeleteSuccess')
  });
}

function* deleteAccountFailureSaga(action: PayloadAction<string>) {
  Modal.error({
    content: intl.get('account.deleteFailed')
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
    const message = (err as Error).message ?? intl.get('account.unableToRefresh');
    yield put(refreshLixiListFailure(message));
  }
}
function* refreshLixiListSuccessSaga(action: PayloadAction<{ account: Account; lixies: Lixi[] }>) {
  yield put(hideLoading(refreshLixiList.type));
}
function* refreshLixiListFailureSaga(action: PayloadAction<number>) {
  const message = action.payload ?? intl.get('account.unableToRefresh');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
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
import { ChangeAccountLocaleCommand } from '../../../../lixi-models/build/module/lib/account/account.dto.d';
import { PatchAccountCommand } from '../../../../lixi-models/src/lib/account/account.dto';

function* watchSelectAccount() {
  yield takeLatest(selectAccount.type, selectAccountSaga);
}

function* watchSelectAccountSuccess() {
  yield takeLatest(selectAccountSuccess.type, selectAccountSuccessSaga);
}

function* watchSelectAccountFailure() {
  yield takeLatest(selectAccountFailure.type, selectAccountFailureSaga);
}

function* watchSetAccount() {
  yield takeLatest(setAccount.type, setAccountSaga);
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

function* watchChangeAccountLocale() {
  yield takeLatest(changeAccountLocale.type, changeAccountLocaleSaga);
}

function* watchChangeAccountLocaleSuccessSaga() {
  yield takeLatest(changeAccountLocaleSuccess.type, changeAccountLocaleSuccessSaga);
}

function* watchChangeAccountLocaleFailureSaga() {
  yield takeLatest(changeAccountLocaleFailure.type, changeAccountLocaleFailureSaga);
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
    fork(watchSetAccount),
    fork(watchRefreshLixiList),
    fork(watchRefreshLixiListSuccess),
    fork(watchRefreshLixiListFailure),
    fork(watchRenameAccount),
    fork(watchRenameAccountSuccess),
    fork(watchRenameAccountFailure),
    fork(watchChangeAccountLocale),
    fork(watchChangeAccountLocaleSuccessSaga),
    fork(watchChangeAccountLocaleFailureSaga),
    fork(watchDeleteAccount),
    fork(watchDeleteAccountSuccess),
    fork(watchDeleteAccountFailure)
  ]);
}
