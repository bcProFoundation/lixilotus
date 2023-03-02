import { BurnType, Burn, BurnCommand, BurnForType } from '@bcpros/lixi-models/lib/burn';
import { all, call, fork, takeLatest, take, put as putChannel } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { PatchCollection } from '@reduxjs/toolkit/dist/query/core/buildThunks';
import { api as postApi } from '@store/post/posts.api';
import { api as commentApi } from '@store/comment/comments.api';
import { api as tokenApi } from '@store/token/tokens.api';
import { showToast } from '@store/toast/actions';
import { burnForToken, burnForTokenFailure, burnForTokenSucceses, getTokenById } from '@store/token';
import * as _ from 'lodash';
import intl from 'react-intl-universal';
import { actionChannel, select, race, put } from 'redux-saga/effects';
import { OrderDirection, PostOrderField } from 'src/generated/types.generated';
import { hideLoading } from '../loading/actions';
import {
  burnForUpDownVote,
  burnForUpDownVoteFailure,
  burnForUpDownVoteSuccess,
  startBurnChannel,
  addBurnToQueue
} from './actions';
import burnApi from './api';
import { PostsQueryTag } from '@bcpros/lixi-models/constants';
import { channel } from 'redux-saga';

function* burnForUpDownVoteSaga(action: PayloadAction<BurnCommand>) {
  let patches, patch: PatchCollection;

  const command = action.payload;
  const { burnForId: postId, queryParams } = command;
  let burnValue = _.toNumber(command.burnValue);

  try {
    const dataApi: BurnCommand = {
      ...command
    };

    if (command.burnForType === BurnForType.Token) {
      patches = yield updateTokenBurnValue(action);
    } else if (command.burnForType === BurnForType.Post) {
      patches = yield updatePostBurnValue(action);
    } else if (command.burnForType === BurnForType.Comment) {
      patches = yield updateCommentBurnValue(action);
    }

    const data: Burn = yield call(burnApi.post, dataApi);

    if (command.burnForType === BurnForType.Token) {
      yield put(burnForTokenSucceses());
    }

    if (_.isNil(data) || _.isNil(data.id)) {
      throw new Error(intl.get('post.unableToBurnForPost'));
    }

    yield put(burnForUpDownVoteSuccess(data));
  } catch (err) {
    let message;
    if (command.burnForType === BurnForType.Token) {
      message = (err as Error)?.message ?? intl.get('token.unableToBurn');
      yield put(burnForTokenFailure({ id: command.burnForId, burnType: command.burnType, burnValue: burnValue }));
    } else if (command.burnForType === BurnForType.Post) {
      message = (err as Error)?.message ?? intl.get('post.unableToBurn');
      const params = {
        orderBy: {
          direction: OrderDirection.Desc,
          field: PostOrderField.UpdatedAt
        }
      };
      if (patches) {
        yield put(postApi.util.patchQueryData('Posts', params, patches.inversePatches));
      }
      if (patch) {
        yield put(postApi.util.patchQueryData('Post', { id: postId }, patch.inversePatches));
      }
    } else if (command.burnForType === BurnForType.Comment) {
      message = (err as Error)?.message ?? intl.get('comment.unableToBurn');
      if (patches) {
        yield put(commentApi.util.patchQueryData('CommentsToPostId', queryParams, patches.inversePatches));
      }
    }
    yield put(burnForUpDownVoteFailure(message));
  }
}

function* burnForUpDownVoteSuccessSaga(action: PayloadAction<Burn>) {
  console.log('done burning');
  yield put(hideLoading(burnForUpDownVote.type));
}

function* burnForUpDownVoteFailureSaga(action: PayloadAction<string>) {
  console.log('failed burning');
  yield put(
    showToast('error', {
      message: action.payload,
      duration: 5
    })
  );
  yield put(hideLoading(burnForUpDownVote.type));
}

function* updatePostBurnValue(action: PayloadAction<BurnCommand>) {
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
    case PostsQueryTag.Post:
      return yield put(
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
      yield put(
        postApi.util.updateQueryData('OrphanPosts', params, draft => {
          const postToUpdateIndex = draft.allOrphanPosts.edges.findIndex(item => item.node.id === command.burnForId);
          const postToUpdate = draft.allOrphanPosts.edges[postToUpdateIndex];
          if (postToUpdateIndex >= 0) {
            let lotusBurnUp = postToUpdate?.node?.lotusBurnUp ?? 0;
            let lotusBurnDown = postToUpdate?.node?.lotusBurnDown ?? 0;
            if (command.burnType == BurnType.Up) {
              lotusBurnUp = lotusBurnUp + burnValue;
            } else {
              lotusBurnDown = lotusBurnDown + burnValue;
            }
            const lotusBurnScore = lotusBurnUp - lotusBurnDown;
            draft.allOrphanPosts.edges[postToUpdateIndex].node.lotusBurnUp = lotusBurnUp;
            draft.allOrphanPosts.edges[postToUpdateIndex].node.lotusBurnDown = lotusBurnDown;
            draft.allOrphanPosts.edges[postToUpdateIndex].node.lotusBurnScore = lotusBurnScore;
            if (lotusBurnScore < 0) {
              draft.allOrphanPosts.edges.splice(postToUpdateIndex, 1);
              draft.allOrphanPosts.totalCount = draft.allOrphanPosts.totalCount - 1;
            }
          }
        })
      );
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

function* updateCommentBurnValue(action: PayloadAction<BurnCommand>) {
  const command = action.payload;
  const { queryParams: params } = command;
  let burnValue = _.toNumber(command.burnValue);

  return yield put(
    commentApi.util.updateQueryData('CommentsToPostId', params, draft => {
      const commentToUpdateIndex = draft.allCommentsToPostId.edges.findIndex(
        item => item.node.id === command.burnForId
      );
      const commentToUpdate = draft.allCommentsToPostId.edges[commentToUpdateIndex];
      if (commentToUpdateIndex >= 0) {
        let lotusBurnUp = commentToUpdate?.node?.lotusBurnUp ?? 0;
        let lotusBurnDown = commentToUpdate?.node?.lotusBurnDown ?? 0;
        if (command.burnType == BurnType.Up) {
          lotusBurnUp = lotusBurnUp + burnValue;
        } else {
          lotusBurnDown = lotusBurnDown + burnValue;
        }
        const lotusBurnScore = lotusBurnUp - lotusBurnDown;
        draft.allCommentsToPostId.edges[commentToUpdateIndex].node.lotusBurnUp = lotusBurnUp;
        draft.allCommentsToPostId.edges[commentToUpdateIndex].node.lotusBurnDown = lotusBurnDown;
        draft.allCommentsToPostId.edges[commentToUpdateIndex].node.lotusBurnScore = lotusBurnScore;
        if (lotusBurnScore < 0) {
          draft.allCommentsToPostId.edges.splice(commentToUpdateIndex, 1);
          draft.allCommentsToPostId.totalCount = draft.allCommentsToPostId.totalCount - 1;
        }
      }
    })
  );
}

function* updateTokenBurnValue(action: PayloadAction<BurnCommand>) {
  const command = action.payload;
  let burnValue = _.toNumber(command.burnValue);

  return yield put(
    tokenApi.util.updateQueryData('Token', { tokenId: command.burnForId }, draft => {
      let lotusBurnUp = draft?.token?.lotusBurnUp ?? 0;
      let lotusBurnDown = draft?.token?.lotusBurnDown ?? 0;
      if (command.burnType == BurnType.Up) {
        lotusBurnUp = lotusBurnUp + burnValue;
      } else {
        lotusBurnDown = lotusBurnDown + burnValue;
      }
      const lotusBurnScore = lotusBurnUp - lotusBurnDown;
      draft.token.lotusBurnUp = lotusBurnUp;
      draft.token.lotusBurnDown = lotusBurnDown;
      draft.token.lotusBurnScore = lotusBurnScore;
    })
  );
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

function* watchBurnForUpDownVoteChannel() {
  // 1- Create a channel for request actions
  const burnChannel = yield actionChannel(burnForUpDownVote.type);
  while (true) {
    // 2- take from the channel

    const action = yield take(burnChannel);

    // 3- Note that we're using a blocking call
    yield call(burnForUpDownVoteSaga, action);
  }
}

function* watchRequests() {
  const chan = yield call(channel);
  console.log('create');

  yield fork(handleRequest, chan);

  while (true) {
    const { payload } = yield take('REQUEST');
    console.log(payload);
    yield putChannel(chan, payload);
  }
}

function* handleRequest(chan) {
  while (true) {
    const payload = yield take(chan);
    console.log(payload);
    // process the request
    const result = yield put(burnForUpDownVote(payload));
    // dispatch an action with the result
    console.log(result);
    yield put({ type: 'REQUEST_COMPLETE', result });
  }
}

function* processRequest(payload) {
  // simulate processing the request
  const simulate = Math.random() * 2000;
  return new Promise(resolve => setTimeout(() => resolve(simulate), simulate));
}

// function* startStopBurnChannel() {
//   while (true) {
//     yield take(startBurnChannel.type);
//     yield race([yield call(createBurnChannelSaga)]);
//   }
// }

export default function* burnSaga() {
  if (typeof window === 'undefined') {
    yield all([
      fork(watchBurnForUpDownVote),
      fork(watchBurnForUpDownVoteChannel),
      fork(watchBurnForUpDownVoteSuccess),
      fork(watchBurnForUpDownVoteFailure)
    ]);
  } else {
    yield all([
      fork(watchRequests),
      fork(watchBurnForUpDownVote),
      fork(watchBurnForUpDownVoteChannel),
      fork(watchBurnForUpDownVoteSuccess),
      fork(watchBurnForUpDownVoteFailure)
    ]);
  }
}
