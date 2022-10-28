import { callConfig } from '@context/index';
import { all, call, fork, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { activateWallet, activateWalletFailure, activateWalletSuccess } from './actions';
import { WalletPathAddressInfo } from './models';

function* activateWalletSaga(action: PayloadAction<string>) {
  try {
    const Wallet = callConfig.call.walletContext;
    const mnemonic = action.payload;
    const defaultPath = "m/44'/10605'/0'/0/0";
    const walletPaths: WalletPathAddressInfo[] = yield call(Wallet.getWalletPathDetails, mnemonic, [defaultPath]);

    yield put(activateWalletSuccess({
      walletPaths,
      mnemonic
    }));
  } catch (err) {
    yield put(activateWalletFailure(JSON.stringify(err)));
  }

}

function* watchActivateWalletSaga() {
  yield takeLatest(activateWallet.type, activateWalletSaga)
}

export default function* walletSaga() {
  yield all([
    fork(watchActivateWalletSaga)
  ]);
}
