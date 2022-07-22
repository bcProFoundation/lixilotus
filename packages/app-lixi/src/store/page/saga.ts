import * as _ from 'lodash';
import * as Effects from 'redux-saga/effects';
import intl from 'react-intl-universal';
import { all, fork, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { hideLoading, showLoading } from '../loading/actions';
import { showToast } from '../toast/actions';
import {
  getPagesByAccountId,
  postPage,
  postPageFailure,
  postPageSuccess,
  setPage,
  setPagesByAccountId
} from './action';
import { CreatePageCommand } from '@bcpros/lixi-models/src';
import pageApi from './api';
import { PageDto } from '@bcpros/lixi-models';

const call: any = Effects.call;
/**
 * Generate a page
 * @param action The data to needed generate a page
 */

function* postPageSaga(action: PayloadAction<CreatePageCommand>) {
  try {
    const command = action.payload;

    yield put(showLoading(postPage.type));

    const dataApi: CreatePageCommand = {
      ...command
    };

    const data: PageDto = yield call(pageApi.post, dataApi);

    if (_.isNil(data) || _.isNil(data.id)) {
      throw new Error(intl.get('lixi.unableCreateLixi'));
    }

    yield put(postPageSuccess(data));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('page.couldNotpostPage');
    yield put(postPageFailure(message));
  }
}

function* postPageSuccessSaga(action: PayloadAction<any>) {
  try {
    const page: any = action.payload;

    // Calculate
    yield put(
      showToast('success', {
        message: 'Success',
        description: intl.get('page.createPageSuccessful'),
        duration: 5
      })
    );
    yield put(setPage(page));
    yield put(hideLoading(postPage.type));
  } catch (error) {
    const message = intl.get('page.errorWhenCreatePage');
    yield put(postPageFailure(message));
  }
}

function* postPageFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('page.unableCreatePageServer');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
  yield put(hideLoading(postPage.type));
}

function* setPageSaga(action: PayloadAction<any>) {
  const page: any = action.payload;
  // yield put(push('/admin/lixi'));
  // yield put(refreshLixiSilent(lixi.id));
}

function* getPagesByAccountIdSaga(action: PayloadAction<number>) {
  try {
    const command = action.payload;

    yield put(showLoading(getPagesByAccountId.type));

    const dataApi: number = command;

    const data: any = yield call(pageApi.get, dataApi);

    if (_.isNil(data)) {
      throw new Error(intl.get('lixi.unableCreateLixi'));
    }

    // yield put(postPageSuccess(data));
    yield put(setPagesByAccountId(data));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('lixi.couldNotpostPage');
    yield put(postPageFailure(message));
  }
}

function* watchPostPage() {
  yield takeLatest(postPage.type, postPageSaga);
}

function* watchPostPageSuccess() {
  yield takeLatest(postPageSuccess.type, postPageSuccessSaga);
}

function* watchPostPageFailure() {
  yield takeLatest(postPageFailure.type, postPageFailureSaga);
}

function* watchSetPage() {
  yield takeLatest(setPage.type, setPageSaga);
}

function* watchGetPagesByAccountId() {
  yield takeLatest(getPagesByAccountId.type, getPagesByAccountIdSaga);
}

export default function* pageSaga() {
  yield all([
    fork(watchPostPage),
    fork(watchPostPageFailure),
    fork(watchPostPageSuccess),
    fork(watchSetPage),
    fork(watchGetPagesByAccountId)
  ]);
}
