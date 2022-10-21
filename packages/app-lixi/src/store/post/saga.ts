import * as _ from 'lodash';
import * as Effects from 'redux-saga/effects';
import intl from 'react-intl-universal';
import { all, fork, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { hideLoading, showLoading } from '../loading/actions';
import { showToast } from '../toast/actions';
import {
  editPost,
  editPostFailure,
  editPostSuccess,
  fetchAllPosts,
  fetchAllPostsFailure,
  fetchAllPostsSuccess,
  getPostsByAccountId,
  postPost,
  postPostFailure,
  postPostSuccess,
  getPost,
  getPostFailure,
  getPostSuccess,
  setPost,
  setPostsByAccountId
} from './action';
import { CreatePostCommand } from '@bcpros/lixi-models/src';
import postApi from './api';
import { AccountDto, EditPostCommand, Post } from '@bcpros/lixi-models';

const call: any = Effects.call;
/**
 * Generate a post
 * @param action The data to needed generate a post
 */

function* postPostSaga(action: PayloadAction<CreatePostCommand>) {
  try {
    const command = action.payload;

    yield put(showLoading(postPost.type));

    const dataApi: CreatePostCommand = {
      ...command
    };

    const data = yield call(postApi.post, dataApi);

    if (_.isNil(data) || _.isNil(data.id)) {
      throw new Error(intl.get('lixi.unableCreateLixi'));
    }

    yield put(postPostSuccess(data));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('post.couldNotpostPost');
    yield put(postPostFailure(message));
  }
}

function* postPostSuccessSaga(action: PayloadAction<any>) {
  try {
    const post: any = action.payload;

    // Calculate
    yield put(
      showToast('success', {
        message: 'Success',
        description: intl.get('post.createPostSuccessful'),
        duration: 5
      })
    );
    yield put(setPost(post));
    yield put(hideLoading(postPost.type));
  } catch (error) {
    const message = intl.get('post.errorWhenCreatePost');
    yield put(postPostFailure(message));
  }
}

function* postPostFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('post.unableCreatePostServer');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
  yield put(hideLoading(postPost.type));
}

function* getPostSaga(action: PayloadAction<string>) {
  try {
    const id = action.payload;
    const data = yield call(postApi.getDetailPost, id);
    yield put(getPostSuccess(data));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('post.unableSelect');
    yield put(getPostFailure(message));
  }
}

function* getPostFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('lixi.unableSelect');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
  yield put(hideLoading(getPost.type));
}

function* editPostSaga(action: PayloadAction<EditPostCommand>) {
  try {
    const { id } = action.payload;
    const command = action.payload;

    yield put(showLoading(editPost.type));

    const dataApi: EditPostCommand = {
      ...command
    };

    const data = yield call(postApi.update, id, dataApi);

    if (_.isNil(data) || _.isNil(data.id)) {
      throw new Error(intl.get('lixi.unableCreateLixi'));
    }

    yield put(editPostSuccess(data));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('post.couldNoteditPost');
    yield put(editPostFailure(message));
  }
}

function* editPostSuccessSaga(action: PayloadAction<any>) {
  try {
    const post: any = action.payload;

    // Calculate
    yield put(
      showToast('success', {
        message: 'Success',
        description: intl.get('post.createPostSuccessful'),
        duration: 5
      })
    );
    yield put(setPost(post));
    yield put(hideLoading(editPost.type));
  } catch (error) {
    const message = intl.get('post.errorWhenCreatePost');
    yield put(editPostFailure(message));
  }
}

function* editPostFailureSaga(action: PayloadAction<string>) {
  const message = action.payload ?? intl.get('post.unableCreatePostServer');
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
  yield put(hideLoading(editPost.type));
}

function* setPostSaga(action: PayloadAction<any>) {
  const post: any = action.payload;
  // yield put(push('/post/lixi'));
  // yield put(refreshLixiSilent(lixi.id));
}

function* getPostsByAccountIdSaga(action: PayloadAction<number>) {
  try {
    const command = action.payload;

    yield put(showLoading(getPostsByAccountId.type));

    const dataApi: number = command;

    const data: any = yield call(postApi.getAllPostByAccount, dataApi);

    if (_.isNil(data)) {
      throw new Error(intl.get('lixi.unableCreateLixi'));
    }

    // yield put(postPostSuccess(data));
    yield put(setPostsByAccountId(data));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('lixi.couldNotpostPost');
    yield put(postPostFailure(message));
  }
}

function* fetchAllPostsSaga() {
  try {
    yield put(showLoading(fetchAllPosts.type));

    const data: any = yield call(postApi.getAllPostsByPage);

    if (_.isNil(data)) {
      throw new Error(intl.get('post.couldNotFindPost'));
    }

    yield put(fetchAllPostsSuccess(data));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('lixi.couldNotpostPost');
    yield put(fetchAllPostsFailure(message));
  }
}

function* fetchAllPostsSuccessSaga(action: any) {
  yield put(hideLoading(fetchAllPosts.type));
}

function* fetchAllPostsFailureSaga(action: any) {
  yield put(hideLoading(fetchAllPosts.type));
}

function* watchPostPost() {
  yield takeLatest(postPost.type, postPostSaga);
}

function* watchPostPostSuccess() {
  yield takeLatest(postPostSuccess.type, postPostSuccessSaga);
}

function* watchPostPostFailure() {
  yield takeLatest(postPostFailure.type, postPostFailureSaga);
}

function* watchEditPost() {
  yield takeLatest(editPost.type, editPostSaga);
}

function* watchEditPostSuccess() {
  yield takeLatest(editPostSuccess.type, editPostSuccessSaga);
}

function* watchEditPostFailure() {
  yield takeLatest(editPostFailure.type, editPostFailureSaga);
}

function* watchSetPost() {
  yield takeLatest(setPost.type, setPostSaga);
}

function* watchGetPostsByAccountId() {
  yield takeLatest(getPostsByAccountId.type, getPostsByAccountIdSaga);
}

function* watchFetchAllPosts() {
  yield takeLatest(fetchAllPosts.type, fetchAllPostsSaga);
}

function* watchFetchAllPostsSuccess() {
  yield takeLatest(fetchAllPostsSuccess.type, fetchAllPostsSuccessSaga);
}

function* watchFetchAllPostsFailure() {
  yield takeLatest(fetchAllPostsFailure.type, fetchAllPostsFailureSaga);
}

function* watchGetPost() {
  yield takeLatest(getPost.type, getPostSaga);
}
function* watchGetPostFailure() {
  yield takeLatest(getPostFailure.type, getPostFailureSaga);
}

export default function* postSaga() {
  yield all([
    fork(watchPostPost),
    fork(watchPostPostFailure),
    fork(watchPostPostSuccess),
    fork(watchSetPost),
    fork(watchGetPostsByAccountId),
    fork(watchFetchAllPosts),
    fork(watchFetchAllPostsSuccess),
    fork(watchFetchAllPostsFailure),
    fork(watchEditPost),
    fork(watchEditPostFailure),
    fork(watchEditPostSuccess),
    fork(watchGetPost),
    fork(watchGetPostFailure)
  ]);
}
