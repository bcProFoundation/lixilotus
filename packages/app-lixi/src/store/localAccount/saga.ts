import { LocalUserAccount } from '@bcpros/lixi-models';
import BCHJS from '@bcpros/xpi-js';
import { PayloadAction } from '@reduxjs/toolkit';
import { getCurrentLocale } from '@store/settings/selectors';
import intl from 'react-intl-universal';
import { all, call, fork, getContext, put, select, takeLatest } from 'redux-saga/effects';
import { LocalUser } from 'src/models/localUser';
import { showToast } from '../toast/actions';
import {
  generateLocalUserAccount,
  importLocalUserAccount,
  setLocalUserAccount,
  silentLocalLogin,
  silentLocalLoginFailure,
  silentLocalLoginSuccess
} from './actions';
import localAccountApi from './api';

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
  } catch (err) {
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

function* setLocalUserAccountSaga(action: PayloadAction<LocalUserAccount>) {
  const account = action.payload;
  const localUser: LocalUser = {
    id: account.address,
    address: account.address,
    name: account.name
  };
  yield put(silentLocalLogin(localUser));
}

function* silentLocalLoginSaga(action: PayloadAction<LocalUser>) {
  try {
    const localUser = action.payload;
    yield call(localAccountApi.localLogin, localUser);
    yield put(silentLocalLoginSuccess(localUser));
  } catch (err) {
    yield put(silentLocalLoginFailure());
  }
}

function* watchGenerateLocalUserAccount() {
  yield takeLatest(generateLocalUserAccount.type, generateLocalUserAccountSaga);
}

function* watchImportLocalUserAccount() {
  yield takeLatest(importLocalUserAccount.type, importLocalUserAccountSaga);
}

function* watchSetLocalUserAccountSaga() {
  yield takeLatest(setLocalUserAccount.type, setLocalUserAccountSaga);
}

function* watchSilentLocalLogin() {
  yield takeLatest(silentLocalLogin.type, silentLocalLoginSaga);
}

export default function* accountSaga() {
  yield all([
    fork(watchGenerateLocalUserAccount),
    fork(watchImportLocalUserAccount),
    fork(watchSetLocalUserAccountSaga),
    fork(watchSilentLocalLogin)
  ]);
}
