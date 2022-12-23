import { BurnType, Burn, BurnCommand, BurnForType } from '@bcpros/lixi-models/lib/burn';
import { all, call, fork, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { PatchCollection } from '@reduxjs/toolkit/dist/query/core/buildThunks';
import { api as postApi } from '@store/post/posts.api';
import { showToast } from '@store/toast/actions';
import { burnForToken, burnForTokenFailure, getTokenById } from '@store/tokens';
import * as _ from 'lodash';
import intl from 'react-intl-universal';
import { put, select } from 'redux-saga/effects';
import { OrderDirection, PostOrderField } from 'src/generated/types.generated';
import { D } from 'styled-icons/crypto';
import { hideLoading } from '../loading/actions';
import { burnForUpDownVote, burnForUpDownVoteFailure, burnForUpDownVoteSuccess, updatePostBurnValue } from './actions';
import burnApi from './api';
import { PostsQueryTag } from '@bcpros/lixi-models/constants';

function* burnForUpDownVoteSaga(action: PayloadAction<BurnCommand>) {
  let patches, patch: PatchCollection;

  const command = action.payload;
  const { burnForId: postId } = command;
  let burnValue = _.toNumber(command.burnValue);

  try {
    const dataApi: BurnCommand = {
      ...command
    };

    if (command.burnForType === BurnForType.Token) {
      yield put(burnForToken({id: command.burnForId, burnType: command.burnType, burnUp: burnValue, burnDown: burnValue}))
    }

    patches = yield put(updatePostBurnValue(command));

    const data: Burn = yield call(burnApi.post, dataApi);

    if (_.isNil(data) || _.isNil(data.id)) {
      throw new Error(intl.get('post.unableToBurnForPost'));
    }

    yield put(burnForUpDownVoteSuccess(data));
  } catch (err) {
    const message = (err as Error).message ?? intl.get('post.unableToBurnForPost');
    if (command.burnForType === BurnForType.Token) {
      yield put(burnForTokenFailure({id: command.burnForId, burnType: command.burnType, burnUp: burnValue, burnDown: burnValue}))
    }
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

function* updatePostBurnValueSaga(action: PayloadAction<BurnCommand>) {
  const command = action.payload;
  // @todo: better control the params for search/others
  const params = {
    orderBy: {
      direction: OrderDirection.Desc,
      field: PostOrderField.UpdatedAt
    }
  };

  let burnValue = _.toNumber(command.burnValue);
  switch (command.postQueryTag) {
    case PostsQueryTag.PostsByPageId:
      return yield put(
        postApi.util.updateQueryData('PostsByPageId', { ...params, id: command.pageId }, draft => {
          const postToUpdateIndex = draft.allPostsByPageId.edges.findIndex(item => item.node.id === command.burnForId);
          const postToUpdate = draft.allPostsByPageId.edges[postToUpdateIndex];
          if (postToUpdateIndex >= 0) {
            let lotusBurnUp = postToUpdate?.node?.lotusBurnUp ?? 0;
            let lotusBurnDown = postToUpdate?.node?.lotusBurnDown ?? 0;
            if (command.burnType == BurnType.Up) {
              lotusBurnUp = lotusBurnUp + burnValue;
            } else {
              lotusBurnDown = lotusBurnDown + burnValue;
            }
            const lotusBurnScore = lotusBurnUp - lotusBurnDown;
            draft.allPostsByPageId.edges[postToUpdateIndex].node.lotusBurnUp = lotusBurnUp;
            draft.allPostsByPageId.edges[postToUpdateIndex].node.lotusBurnDown = lotusBurnDown;
            draft.allPostsByPageId.edges[postToUpdateIndex].node.lotusBurnScore = lotusBurnScore;
            if (lotusBurnScore < 0) {
              draft.allPostsByPageId.edges.splice(postToUpdateIndex, 1);
              draft.allPostsByPageId.totalCount = draft.allPostsByPageId.totalCount - 1;
            }
          }
        })
      );
    case PostsQueryTag.PostsByTokenId:
      return yield put(
        postApi.util.updateQueryData('PostsByTokenId', { ...params, id: command.tokenId }, draft => {
          const postToUpdateIndex = draft.allPostsByTokenId.edges.findIndex(item => item.node.id === command.burnForId);
          const postToUpdate = draft.allPostsByTokenId.edges[postToUpdateIndex];
          if (postToUpdateIndex >= 0) {
            let lotusBurnUp = postToUpdate?.node?.lotusBurnUp ?? 0;
            let lotusBurnDown = postToUpdate?.node?.lotusBurnDown ?? 0;
            if (command.burnType == BurnType.Up) {
              lotusBurnUp = lotusBurnUp + burnValue;
            } else {
              lotusBurnDown = lotusBurnDown + burnValue;
            }
            const lotusBurnScore = lotusBurnUp - lotusBurnDown;
            draft.allPostsByTokenId.edges[postToUpdateIndex].node.lotusBurnUp = lotusBurnUp;
            draft.allPostsByTokenId.edges[postToUpdateIndex].node.lotusBurnDown = lotusBurnDown;
            draft.allPostsByTokenId.edges[postToUpdateIndex].node.lotusBurnScore = lotusBurnScore;
            if (lotusBurnScore < 0) {
              draft.allPostsByTokenId.edges.splice(postToUpdateIndex, 1);
              draft.allPostsByTokenId.totalCount = draft.allPostsByTokenId.totalCount - 1;
            }
          }
        })
      );
    default:
      return yield put(
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
  }
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

function* watchUpdatePostBurnValueSaga() {
  yield takeLatest(updatePostBurnValue.type, updatePostBurnValueSaga);
}

export default function* burnSaga() {
  yield all([
    fork(watchBurnForUpDownVote),
    fork(watchBurnForUpDownVoteSuccess),
    fork(watchBurnForUpDownVoteFailure),
    fork(watchUpdatePostBurnValueSaga)
  ]);
}
