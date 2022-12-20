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
import { D } from 'styled-icons/crypto';
import { hideLoading } from '../loading/actions';
import { burnForUpDownVote, burnForUpDownVoteFailure, burnForUpDownVoteSuccess } from './actions';
import burnApi from './api';

function* burnForUpDownVoteSaga(action: PayloadAction<BurnCommand>) {
  let patches, patch: PatchCollection;

  const command = action.payload;
  const { burnForId: postId } = command;
  try {
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
        const postToUpdateIndex = draft.allPosts.edges.findIndex(item => item.node.id === command.burnForId);
        const postToUpdate = draft.allPosts.edges[postToUpdateIndex];
        if (postToUpdateIndex >= 0) {
          let lotusBurnUp = postToUpdate?.node?.lotusBurnUp ?? 0;
          let lotusBurnDown = postToUpdate?.node?.lotusBurnDown ?? 0;
          if (command.burnType == BurnType.Up) {
            lotusBurnUp = lotusBurnUp + burnValue;
          } else {
            lotusBurnDown = lotusBurnDown + burnValue;
          }
          const lotusBurnScore = lotusBurnUp - lotusBurnDown;
          draft.allPosts.edges[postToUpdateIndex].node.lotusBurnUp = lotusBurnUp;
          draft.allPosts.edges[postToUpdateIndex].node.lotusBurnDown = lotusBurnDown;
          draft.allPosts.edges[postToUpdateIndex].node.lotusBurnScore = lotusBurnScore;
          if (lotusBurnScore < 0) {
            draft.allPosts.edges.splice(postToUpdateIndex, 1);
            draft.allPosts.totalCount = draft.allPosts.totalCount - 1;
          }
        }
      })
    );

    patch = yield put(
      postApi.util.updateQueryData('Post', { id: command.burnForId }, draft => {
        let lotusBurnUp = draft?.post?.lotusBurnUp ?? 0;
        let lotusBurnDown = draft?.post?.lotusBurnDown ?? 0;
        if (command.burnType == BurnType.Up) {
          lotusBurnUp = lotusBurnUp + burnValue;
        } else {
          lotusBurnDown = lotusBurnDown + burnValue;
        }
        const lotusBurnScore = lotusBurnUp - lotusBurnDown;
        draft.post.lotusBurnUp = lotusBurnUp;
        draft.post.lotusBurnDown = lotusBurnDown;
        draft.post.lotusBurnScore = lotusBurnScore;
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
      yield put(postApi.util.patchQueryData('Post', { id: postId }, patch.inversePatches));
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
