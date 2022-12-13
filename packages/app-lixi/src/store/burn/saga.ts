import { Burn, BurnCommand } from '@bcpros/lixi-models';
import { BurnType } from '@bcpros/lixi-models/lib/burn';
import { all, call, fork, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { PatchCollection } from '@reduxjs/toolkit/dist/query/core/buildThunks';
import { api as postApi } from '@store/post/posts.api';
import { showToast } from '@store/toast/actions';
import * as _ from 'lodash';
import intl from 'react-intl-universal';
import { put } from 'redux-saga/effects';
import { OrderDirection, PostOrderField } from 'src/generated/types.generated';
import { hideLoading } from '../loading/actions';
import { burnForUpDownVote, burnForUpDownVoteFailure, burnForUpDownVoteSuccess } from './actions';
import burnApi from './api';

function* burnForUpDownVoteSaga(action: PayloadAction<BurnCommand>) {
  let patches: PatchCollection;
  try {
    const command = action.payload;

    const dataApi: BurnCommand = {
      ...command
    };

    // @todo: better control the params for search/others
    const params = {
      orderBy: {
        direction: OrderDirection.Desc,
        field: PostOrderField.UpdatedAt
      }
    };

    let burnValue = _.toNumber(command.burnValue);

    patches = yield put(
      postApi.util.updateQueryData('Posts', params, draft => {
        const postToUpdate = draft.allPosts.edges.find(item => item.node.id === command.burnForId);
        if (postToUpdate) {
          let lotusBurnUp = postToUpdate?.node?.lotusBurnUp ?? 0;
          let lotusBurnDown = postToUpdate?.node?.lotusBurnDown ?? 0;
          if (command.burnType == BurnType.Up) {
            lotusBurnUp = lotusBurnUp + burnValue;
          } else {
            lotusBurnDown = lotusBurnDown + burnValue;
          }
          const lotusBurnScore = lotusBurnUp - lotusBurnDown;
          postToUpdate.node = {
            ...postToUpdate.node,
            lotusBurnUp,
            lotusBurnDown,
            lotusBurnScore
          };
        }
      })
    );

    const data: Burn = yield call(burnApi.post, dataApi);

    if (_.isNil(data) || _.isNil(data.id)) {
      throw new Error(intl.get('post.unableToBurnForPost'));
    }

    yield put(burnForUpDownVoteSuccess(data));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('post.unableToBurnForPost');
    yield put(burnForUpDownVoteFailure(message));
    const params = {
      orderBy: {
        direction: OrderDirection.Desc,
        field: PostOrderField.UpdatedAt
      }
    };
    if (patches) {
      yield put(postApi.util.patchQueryData('Posts', params, patches.inversePatches));
    }
  }
}

function* burnForUpDownVoteSuccessSaga(action: PayloadAction<Burn>) {
  yield put(hideLoading(burnForUpDownVote.type));
}

function* burnForUpDownVoteFailureSaga(action: PayloadAction<string>) {
  yield put(
    showToast('error', {
      message: intl.get('post.unableToBurn'),
      duration: 5
    })
  );
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
