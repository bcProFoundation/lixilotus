import * as _ from 'lodash';
import * as Effects from 'redux-saga/effects';
import intl from 'react-intl-universal';
import { all, fork, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { hideLoading, showLoading } from '../loading/actions';
import { showToast } from '../toast/actions';
import {
  editPage,
  editPageFailure,
  editPageSuccess,
  fetchAllPages,
  fetchAllPagesFailure,
  fetchAllPagesSuccess,
  getPagesByAccountId,
  postPage,
  postPageFailure,
  postPageSuccess,
  getPage,
  getPageFailure,
  getPageSuccess,
  setPage,
  setPagesByAccountId
} from './action';
import { CreatePageCommand } from '@bcpros/lixi-models/src';
import pageApi from './api';
import { AccountDto, EditPageCommand, Page, PageDto } from '@bcpros/lixi-models';

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

function* getPageSaga(action: PayloadAction<string>) {
  try {
    const id = action.payload;
    const data = yield call(pageApi.getDetailPage, id);
    yield put(getPageSuccess(data));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('page.unableSelect');
    yield put(getPageFailure(message));
  }
}

function* getPageFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('lixi.unableSelect');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
  yield put(hideLoading(getPage.type));
}

function* editPageSaga(action: PayloadAction<EditPageCommand>) {
  try {
    const { id } = action.payload;
    const command = action.payload;

    yield put(showLoading(editPage.type));

    const dataApi: EditPageCommand = {
      ...command
    };

    const data: PageDto = yield call(pageApi.update, id, dataApi);

    if (_.isNil(data) || _.isNil(data.id)) {
      throw new Error(intl.get('lixi.unableCreateLixi'));
    }

    yield put(editPageSuccess(data));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('page.couldNoteditPage');
    yield put(editPageFailure(message));
  }
}

function* editPageSuccessSaga(action: PayloadAction<any>) {
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
    yield put(hideLoading(editPage.type));
  } catch (error) {
    const message = intl.get('page.errorWhenCreatePage');
    yield put(editPageFailure(message));
  }
}

function* editPageFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('page.unableCreatePageServer');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
  yield put(hideLoading(editPage.type));
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

    const data: any = yield call(pageApi.getSubPage, dataApi);

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

function* fetchAllPagesSaga() {
  try {
    yield put(showLoading(fetchAllPages.type));

    const data: any = yield call(pageApi.getAllPages);

    if (_.isNil(data)) {
      throw new Error(intl.get('page.couldNotFindPage'));
    }

    yield put(fetchAllPagesSuccess(data));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('lixi.couldNotpostPage');
    yield put(fetchAllPagesFailure(message));
  }
}

function* fetchAllPagesSuccessSaga(action: any) {
  yield put(hideLoading(fetchAllPages.type));
}

function* fetchAllPagesFailureSaga(action: any) {
  yield put(hideLoading(fetchAllPages.type));
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

function* watchEditPage() {
  yield takeLatest(editPage.type, editPageSaga);
}

function* watchEditPageSuccess() {
  yield takeLatest(editPageSuccess.type, editPageSuccessSaga);
}

function* watchEditPageFailure() {
  yield takeLatest(editPageFailure.type, editPageFailureSaga);
}

function* watchSetPage() {
  yield takeLatest(setPage.type, setPageSaga);
}

function* watchGetPagesByAccountId() {
  yield takeLatest(getPagesByAccountId.type, getPagesByAccountIdSaga);
}

function* watchFetchAllPages() {
  yield takeLatest(fetchAllPages.type, fetchAllPagesSaga);
}

function* watchFetchAllPagesSuccess() {
  yield takeLatest(fetchAllPagesSuccess.type, fetchAllPagesSuccessSaga);
}

function* watchFetchAllPagesFailure() {
  yield takeLatest(fetchAllPagesFailure.type, fetchAllPagesFailureSaga);
}

function* watchGetPage() {
  yield takeLatest(getPage.type, getPageSaga);
}
function* watchGetPageFailure() {
  yield takeLatest(getPageFailure.type, getPageFailureSaga);
}

export default function* pageSaga() {
  yield all([
    fork(watchPostPage),
    fork(watchPostPageFailure),
    fork(watchPostPageSuccess),
    fork(watchSetPage),
    fork(watchGetPagesByAccountId),
    fork(watchFetchAllPages),
    fork(watchFetchAllPagesSuccess),
    fork(watchFetchAllPagesFailure),
    fork(watchEditPage),
    fork(watchEditPageFailure),
    fork(watchEditPageSuccess),
    fork(watchGetPage),
    fork(watchGetPageFailure),
  ]);
}
