import { BurnCommand } from '@bcpros/lixi-models';
import { all, call, fork, put, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import * as _ from 'lodash';
import intl from 'react-intl-universal';
import { hideLoading } from '../loading/actions';
import { burnForUpDownVote, burnForUpDownVoteSuccess, burnForUpDownVoteFailure } from './actions';

import burnApi from './api';

function* burnForUpDownVoteSaga(action: PayloadAction<BurnCommand>) {
  try {
    const command = action.payload;

    const dataApi: BurnCommand = {
      ...command
    };

    const data = yield call(burnApi.post, dataApi);

    if (_.isNil(data) || _.isNil(data.id)) {
      throw new Error(intl.get('post.unableToBurnForPost'));
    }

    yield put(burnForUpDownVoteSuccess(data));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('post.unableToBurnForPost');
    yield put(burnForUpDownVoteFailure(message));
  }
}

function* burnForUpDownVoteSuccessSaga(action: any) {

  yield put(hideLoading(burnForUpDownVote.type));
}

function* burnForUpDownVoteFailureSaga(action: any) {
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
  yield all([
    fork(watchBurnForUpDownVote),
    fork(watchBurnForUpDownVoteSuccess),
    fork(watchBurnForUpDownVoteFailure)
  ]);
}