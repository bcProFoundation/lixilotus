import { all } from 'redux-saga/effects';
import vaultSaga from './vault/saga';
import redeemSaga from './redeem/saga';
import toastSaga from './toast/saga';

export default function* rootSaga() {
  yield all([
    vaultSaga(),
    redeemSaga(),
    toastSaga()
  ]);
}