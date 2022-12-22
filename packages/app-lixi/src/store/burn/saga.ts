import { BurnType, Burn, BurnCommand, BurnForType } from '@bcpros/lixi-models/lib/burn';
import { all, call, fork, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { PatchCollection } from '@reduxjs/toolkit/dist/query/core/buildThunks';
import { api as postApi } from '@store/post/posts.api';
import { showToast } from '@store/toast/actions';
import { burnForToken, getTokenById } from '@store/tokens';
import * as _ from 'lodash';
import intl from 'react-intl-universal';
import { put, select } from 'redux-saga/effects';
import { OrderDirection, PostOrderField } from 'src/generated/types.generated';
import { D } from 'styled-icons/crypto';
import { hideLoading } from '../loading/actions';
import { burnForUpDownVote, burnForUpDownVoteFailure, burnForUpDownVoteSuccess, counterFailure, counterSuccess } from './actions';
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

    if (command.burnForType === BurnForType.Token) {
      const tokenToBurn = yield select(getTokenById(command.burnForId))
      let lotusBurnUp:number = tokenToBurn.lotusBurnUp ?? 0;
      let lotusBurnDown:number = tokenToBurn.lotusBurnDown ?? 0;
      if (command.burnType == BurnType.Up) {
        lotusBurnUp = burnValue;
      } else {
        lotusBurnDown = burnValue;
      }
      yield put(burnForToken({id: command.burnForId, burnUp: lotusBurnUp, burnDown: lotusBurnDown}))
    }

    patches = yield put(
      postApi.util.updateQueryData('Posts', params, draft => {
        const postToUpdateIndex = draft.allPosts.edges.findIndex(item => item.node.id === command.burnForId);
        const postToUpdate = draft.allPosts.edges[postToUpdateIndex];
        console.log('postToUpdateIndex', postToUpdateIndex);
        console.log('postToUpdate', postToUpdate);
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
