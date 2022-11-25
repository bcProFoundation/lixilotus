import * as _ from 'lodash';
import * as Effects from 'redux-saga/effects';
import intl from 'react-intl-universal';
import { all, fork, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { hideLoading, showLoading } from '../loading/actions';
import { showToast } from '../toast/actions';
import {
  fetchAllTokens,
  fetchAllTokensFailure,
  fetchAllTokensSuccess,
  postToken,
  postTokenFailure,
  postTokenSuccess,
  getToken,
  getTokenFailure,
  getTokenSuccess
} from './action';
import TokenApi from './api';
import { TokenDto } from '@bcpros/lixi-models';

const call: any = Effects.call;
/**
 * Generate a Token
 * @param action The data to needed generate a Token
 */

function* postTokenSaga(action: PayloadAction<any>) {
  try {
    const command = action.payload;

    yield put(showLoading(postToken.type));

    const dataApi: any = {
      ...command
    };

    const data: TokenDto = yield call(TokenApi.post, dataApi);

    if (_.isNil(data) || _.isNil(data.id)) {
      throw new Error('Unable Create Token');
    }

    yield put(postTokenSuccess(data));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('Token.couldNotpostToken');
    yield put(postTokenFailure(message));
  }
}

function* postTokenSuccessSaga(action: PayloadAction<any>) {
  try {
    const Token: any = action.payload;

    // Calculate
    yield put(
      showToast('success', {
        message: 'Success',
        description: intl.get('Token.createTokenSuccessful'),
        duration: 5
      })
    );
    // yield put(setToken(Token));
    yield put(hideLoading(postToken.type));
  } catch (error) {
    const message = intl.get('Token.errorWhenCreateToken');
    yield put(postTokenFailure(message));
  }
}

function* postTokenFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('Token.unableCreateTokenServer');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
  yield put(hideLoading(postToken.type));
}

function* getTokenSaga(action: PayloadAction<string>) {
  try {
    const id = action.payload;
    const data = yield call(TokenApi.getTokenById, id);
    yield put(getTokenSuccess(data));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('Token.unableSelect');
    yield put(getTokenFailure(message));
  }
}

function* getTokenSuccessSaga(action: PayloadAction<string>) {
  try {
    yield put(
      showToast('success', {
        message: 'Success',
        description: intl.get('Token.createTokenSuccessful'),
        duration: 5
      })
    );
    yield put(hideLoading(getToken.type));
  } catch (error) {
    const message = intl.get('Token.errorWhenCreateToken');
    yield put(getTokenFailure(message));
  }
}

function* getTokenFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('lixi.unableSelect');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
  yield put(hideLoading(getToken.type));
}

function* fetchAllTokensSaga() {
  try {
    yield put(showLoading(fetchAllTokens.type));

    const data: any = yield call(TokenApi.getAllTokens);

    if (_.isNil(data)) {
      throw new Error(intl.get('Token.couldNotFindToken'));
    }

    yield put(fetchAllTokensSuccess(data));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('lixi.couldNotpostToken');
    yield put(fetchAllTokensFailure(message));
  }
}

function* fetchAllTokensSuccessSaga(action: any) {
  yield put(hideLoading(fetchAllTokens.type));
}

function* fetchAllTokensFailureSaga(action: any) {
  yield put(hideLoading(fetchAllTokens.type));
}

function* watchPostToken() {
  yield takeLatest(postToken.type, postTokenSaga);
}

function* watchPostTokenSuccess() {
  yield takeLatest(postTokenSuccess.type, postTokenSuccessSaga);
}

function* watchPostTokenFailure() {
  yield takeLatest(postTokenFailure.type, postTokenFailureSaga);
}

function* watchFetchAllTokens() {
  yield takeLatest(fetchAllTokens.type, fetchAllTokensSaga);
}

function* watchFetchAllTokensSuccess() {
  yield takeLatest(fetchAllTokensSuccess.type, fetchAllTokensSuccessSaga);
}

function* watchFetchAllTokensFailure() {
  yield takeLatest(fetchAllTokensFailure.type, fetchAllTokensFailureSaga);
}

function* watchGetToken() {
  yield takeLatest(getToken.type, getTokenSaga);
}

function* watchGetTokenSuccess() {
  yield takeLatest(getTokenSuccess.type, getTokenSuccessSaga);
}

function* watchGetTokenFailure() {
  yield takeLatest(getTokenFailure.type, getTokenFailureSaga);
}

export default function* TokenSaga() {
  yield all([
    fork(watchPostToken),
    fork(watchPostTokenFailure),
    fork(watchPostTokenSuccess),
    fork(watchFetchAllTokens),
    fork(watchFetchAllTokensSuccess),
    fork(watchFetchAllTokensFailure),
    fork(watchGetToken),
    fork(watchGetTokenSuccess),
    fork(watchGetTokenFailure)
  ]);
}
