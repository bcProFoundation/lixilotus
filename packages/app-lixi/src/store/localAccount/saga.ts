import {
  Account,
  AccountDto,
  CreateAccountCommand,
  DeleteAccountCommand,
  ImportAccountCommand,
  Lixi,
  RenameAccountCommand,
  RegisterViaEmailNoVerifiedCommand,
  LoginViaEmailCommand,
  LocalUserAccount
} from '@bcpros/lixi-models';
import BCHJS from '@bcpros/xpi-js';
import { PayloadAction } from '@reduxjs/toolkit';
import { fetchNotifications } from '@store/notification/actions';
import { getCurrentLocale } from '@store/settings/selectors';
import { aesGcmDecrypt, aesGcmEncrypt, numberToBase58 } from '@utils/encryptionMethods';
import { Modal } from 'antd';
import intl from 'react-intl-universal';
import { all, call, fork, getContext, put, putResolve, select, takeLatest } from 'redux-saga/effects';
import { ChangeAccountLocaleCommand } from '../../../../lixi-models/build/module/lib/account/account.dto.d';
import { PatchAccountCommand } from '../../../../lixi-models/src/lib/account/account.dto';
import accountApi from '../account/api';
import lixiApi from '../lixi/api';
import { hideLoading, showLoading } from '../loading/actions';
import { showToast } from '../toast/actions';
import { getAccountById, getSelectedAccount } from './selectors';
import { push } from 'connected-next-router';
import { setLocalUserAccount } from './actions';

/**
 * Generate a account with random encryption password
 * @param action The data to needed generate a account
 */
function* generateLocalUserAccountSaga(action: PayloadAction) {
  const XPI: BCHJS = yield getContext('XPI');
  const Wallet = yield getContext('Wallet');

  const lang = 'english';
  const Bip39128BitMnemonic = XPI.Mnemonic.generate(128, XPI.Mnemonic.wordLists()[lang]);

  const { xAddress } = yield call(Wallet.getWalletDetails, Bip39128BitMnemonic);

  const locale: string | undefined = yield select(getCurrentLocale);

  const name = xAddress.slice(12, 17);

  const account: LocalUserAccount = {
    mnemonic: Bip39128BitMnemonic,
    language: locale,
    address: xAddress as string,
    balance: 0,
    name,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  yield put(
    showToast('success', {
      message: 'Success',
      description: intl.get('account.createAccountSuccessful'),
      duration: 5
    })
  );

  yield put(setLocalUserAccount(account));
}


function* importLocalUserAccountSaga(action: PayloadAction<string>) {
  try {
    const mnemonic: string = action.payload;

    const Wallet = yield getContext('Wallet');

    const locale = yield select(getCurrentLocale);

    const isMnemonicValid = yield call(Wallet.validateMnemonic, mnemonic);

    if (isMnemonicValid) {
      const { xAddress } = yield call(Wallet.getWalletDetails, mnemonic);

      const name = xAddress.slice(12, 17);

      const account: LocalUserAccount = {
        mnemonic,
        language: locale,
        address: xAddress as string,
        balance: 0,
        name,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      yield put(
        showToast('success', {
          message: 'Success',
          description: intl.get('account.accountImportSuccess'),
          duration: 5
        })
      );

      yield put(setLocalUserAccount(account));
    }
  }
  catch (err) {
    const message = action.payload ?? intl.get('account.unableToImport');
    yield put(
      showToast('error', {
        message: 'Error',
        description: message,
        duration: 5
      })
    );
  }
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


function* setAccountSaga(action: PayloadAction<Account>) {
  yield put(setAccountSuccess({ ...action.payload }));
}

function* setAccountSuccessSaga(action: PayloadAction<Account>) {
  const account = yield select(getAccountById(action.payload.id));
  yield putResolve(silentLogin(account.mnemonic));
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

function* changeLocalUserAccountLocaleSaga(action: PayloadAction<ChangeAccountLocaleCommand>) {
  try {
    yield put(showLoading(changeLocalUserAccountLocale.type));
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
  yield put(
    showToast('success', {
      message: 'Success',
      description: intl.get('claim.refreshSuccess'),
      duration: 5
    })
  );
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

function* refreshLixiListSilentSaga(action: PayloadAction<number>) {
  try {
    const accountId = action.payload;
    const data = yield call(accountApi.getById, accountId);
    const account = data as Account;
    const lixiesData = yield call(lixiApi.getByAccountId, accountId);
    const lixies = (lixiesData ?? []) as Lixi[];
    yield put(refreshLixiListSilentSuccess({ account: account, lixies: lixies }));
  } catch (err) { }
}


function* watchGenerateLocalUserAccount() {
  yield takeLatest(generateLocalUseAccount.type, generateLocalUserAccountSaga);
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

function* watchSetAccount() {
  yield takeLatest(setAccount.type, setAccountSaga);
}

function* watchSetAccountSuccess() {
  yield takeLatest(setAccountSuccess.type, setAccountSuccessSaga);
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

function* watchRefreshLixiListSilent() {
  yield takeLatest(refreshLixiListSilent.type, refreshLixiListSilentSaga);
}

function* watchRegisterViaEmailNoVerified() {
  yield takeLatest(registerViaEmailNoVerified.type, registerViaEmailNoVerifiedSaga);
}
function* watchRegisterViaEmailNoVerifiedSuccess() {
  yield takeLatest(registerViaEmailNoVerifiedSuccess.type, registerViaEmailSuccessNoVerifiedSaga);
}
function* watchRegisterViaEmailNoVerifiedFailure() {
  yield takeLatest(registerViaEmailNoVerifiedFailure.type, registerViaEmailFailureNoVerifiedSaga);
}

function* watchloginViaEmail() {
  yield takeLatest(loginViaEmail.type, loginViaEmailSaga);
}
function* watchloginViaEmailSuccess() {
  yield takeLatest(loginViaEmailSuccess.type, loginViaEmailSuccessSaga);
}
function* watchloginViaEmailFailure() {
  yield takeLatest(loginViaEmailFailure.type, loginViaEmailFailureSaga);
}

function* watchVerifyEmailEmail() {
  yield takeLatest(verifyEmail.type, verifyEmailSaga);
}
function* watchVerifyEmailSuccess() {
  yield takeLatest(verifyEmailSuccess.type, verifyEmailSuccessSaga);
}
function* watchVerifyEmailFailure() {
  yield takeLatest(verifyEmailFailure.type, verifyEmailFailureSaga);
}

function* silentLoginSaga(action: PayloadAction<string>) {
  const mnemonic = action.payload;
  try {
    const data = yield call(accountApi.login, mnemonic);
    console.log('data:', data);
    yield put(silentLoginSuccess());
  } catch (err) {
    yield put(silentLoginFailure());
  }
}

export default function* accountSaga() {
  yield all([
    fork(watchGenerateAccount),
    fork(watchGetAccount),
    fork(watchGetAccountSuccess),
    fork(watchGetAccountFailure),
    fork(watchPostAccount),

  ]);
}
