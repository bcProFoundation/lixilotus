import { all } from 'redux-saga/effects';
import vaultSaga from './vault/saga';

export default function* rootSaga() {
  yield all([
    vaultSaga()
  ]);
}