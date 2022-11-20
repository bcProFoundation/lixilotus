import { LocalUserAccount } from '@bcpros/lixi-models';
import { PayloadAction } from '@reduxjs/toolkit';
import { activateWallet } from '@store/wallet';
import { all, call, fork, put, takeLatest } from 'redux-saga/effects';
import { LocalUser } from 'src/models/localUser';
import { setLocalUserAccount, silentLocalLogin, silentLocalLoginFailure, silentLocalLoginSuccess } from './actions';
import localAccountApi from './api';

function* setLocalUserAccountSaga(action: PayloadAction<LocalUserAccount>) {
  const account = action.payload;
  const localUser: LocalUser = {
    id: account.address,
    address: account.address,
    name: account.name
  };
  yield put(activateWallet(account.mnemonic));
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

function* watchSetLocalUserAccountSaga() {
  yield takeLatest(setLocalUserAccount.type, setLocalUserAccountSaga);
}

function* watchSilentLocalLogin() {
  yield takeLatest(silentLocalLogin.type, silentLocalLoginSaga);
}

export default function* accountSaga() {
  yield all([fork(watchSetLocalUserAccountSaga), fork(watchSilentLocalLogin)]);
}
