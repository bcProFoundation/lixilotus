import { Burn, BurnCommand } from '@bcpros/lixi-models';
import { all, call, fork, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { api as postApi, useLazyPostQuery } from '@store/post/posts.api';
import * as _ from 'lodash';
import intl from 'react-intl-universal';
import { Action } from 'redux';
import { hideLoading } from '../loading/actions';
import { burnForUpDownVote, burnForUpDownVoteFailure, burnForUpDownVoteSuccess } from './actions';
import burnApi from './api';

function* burnForUpDownVoteSaga(action: PayloadAction<BurnCommand>) {
  try {
    const command = action.payload;

    const dataApi: BurnCommand = {
      ...command
    };

    const data: Burn = yield call(burnApi.post, dataApi);

    if (_.isNil(data) || _.isNil(data.id)) {
      throw new Error(intl.get('post.unableToBurnForPost'));
    }

    yield put(burnForUpDownVoteSuccess(data));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('post.unableToBurnForPost');
    yield put(burnForUpDownVoteFailure(message));
  }
}

function* burnForUpDownVoteSuccessSaga(action: PayloadAction<Burn>) {
  const burn = action.payload;
  try {
    debugger;
    const [trigger, nextResult] = yield call(useLazyPostQuery);
    const post = yield call(trigger, { id: burn.burnForId });
    console.log('post', post);
    const action = postApi.util.updateQueryData('Post', { id: burn.burnForId }, (draft) => {
      Object.assign(draft, post);
    });
    yield put({ ...action } as Action<any>);
  } catch (err) {
    const message = (err as Error).message ?? intl.get('post.unableToBurnForPost');
    yield put(burnForUpDownVoteFailure(message));
  }


  yield put(hideLoading(burnForUpDownVote.type));
}

function* burnForUpDownVoteFailureSaga(action: PayloadAction<string>) {
  yield put(hideLoading(burnForUpDownVote.type));
}

function* watchBurnForUpDownVote() {
  yield takeLatest(burnForUpDownVote.type, burnForUpDownVoteSaga);
}

function* watchBurnForUpDownVoteSuccess() {
  yield takeLatest(burnForUpDownVoteSuccess.type, burnForUpDownVoteSuccessSaga);
}

function* watchBurnForUpDownVoteFailure() {
  yield takeLatest(burnForUpDownVoteFailure.type, burnForUpDownVoteFailureSaga);
}

export default function* burnSaga() {
  yield all([fork(watchBurnForUpDownVote), fork(watchBurnForUpDownVoteSuccess), fork(watchBurnForUpDownVoteFailure)]);
}
