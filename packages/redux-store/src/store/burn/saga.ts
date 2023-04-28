import { Account } from '@bcpros/lixi-models';
import { PostsQueryTag } from '@bcpros/lixi-models/constants';
import { Burn, BurnCommand, BurnForType, BurnQueueCommand, BurnType } from '@bcpros/lixi-models/lib/burn';
import { callConfig } from '@context/shareContext';
import { all, call, fork, put as putChannel, take, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { PatchCollection } from '@reduxjs/toolkit/dist/query/core/buildThunks';
import { setTransactionNotReady, setTransactionReady } from '@store/account/actions';
import { getTransactionStatus } from '@store/account/selectors';
import { api as commentApi } from '@store/comment/comments.api';
import { api as postApi } from '@store/post/posts.api';
import { showToast } from '@store/toast/actions';
import { burnForToken, burnForTokenFailure, burnForTokenSucceses, getTokenById } from '@store/token';
import { api as tokenApi } from '@store/token/tokens.api';
import { getSlpBalancesAndUtxos } from '@store/wallet';
import { getAllWalletPaths } from '@store/wallet';
import * as _ from 'lodash';
import intl from 'react-intl-universal';
import { buffers, Channel } from 'redux-saga';
import { actionChannel, flush, getContext, put, select } from 'redux-saga/effects';
import { OrderDirection, PostOrderField, TokenOrderField } from 'src/generated/types.generated';
import { hideLoading } from '../loading/actions';

import {
  addBurnTransaction,
  addFailQueue,
  burnForUpDownVote,
  burnForUpDownVoteFailure,
  burnForUpDownVoteSuccess,
  clearBurnQueue,
  createTxHex,
  moveAllBurnToFailQueue,
  removeBurnQueue,
  returnTxHex
} from './actions';
import burnApi from './api';
import { getBurnQueue, getFailQueue } from './selectors';

function* createTxHexSaga(action: any) {
  const data = action.payload;
  const { XPI } = callConfig.call.walletContext;
  const xpiContext = yield getContext('useXPI');
  const walletPaths = yield select(getAllWalletPaths);
  const slpBalancesAndUtxos = yield select(getSlpBalancesAndUtxos);
  const { createBurnTransaction } = xpiContext();
  const burnForId = data.burnForType === BurnForType.Token ? data.tokenId : data.burnForId;
  const tipToAddresses = data.tipToAddresses ? data.tipToAddresses : null;

  try {
    const txHex = createBurnTransaction(
      XPI,
      walletPaths,
      slpBalancesAndUtxos.nonSlpUtxos,
      data.defaultFee,
      data.burnType,
      data.burnForType,
      data.burnedBy,
      burnForId,
      data.burnValue,
      tipToAddresses
    );

    yield put({ type: returnTxHex.type, payload: txHex });
  } catch {
    yield put(moveAllBurnToFailQueue());
    yield put(clearBurnQueue());
  }
}

function* burnForUpDownVoteSaga(action: PayloadAction<any>) {
  let patches, patch: PatchCollection;
  const command = action.payload;

  const { burnForId: postId, queryParams } = command;
  const burnValue = _.toNumber(command.burnValue);
  yield put(createTxHex(command));
  const { payload } = yield take(returnTxHex.type);
  const latestTxHex = payload;

  try {
    const dataApi: BurnCommand = {
      txHex: latestTxHex,
      ...command
    };

    const data: Burn = yield call(burnApi.post, dataApi);

    switch (command.burnForType) {
      case BurnForType.Token:
        patches = yield updateTokenBurnValue(action);
        break;
      case BurnForType.Post:
        patches = yield updatePostBurnValue(action);
        break;
      case BurnForType.Comment:
        patches = yield updateCommentBurnValue(action);
        break;
    }

    if (command.burnForType === BurnForType.Token) {
      yield put(burnForTokenSucceses());
    }

    if (_.isNil(data) || _.isNil(data.id)) {
      throw new Error(intl.get('post.unableToBurnForPost'));
    }

    yield put(removeBurnQueue());
    yield put(burnForUpDownVoteSuccess(data));
  } catch (err) {
    let message;
    yield put(removeBurnQueue());
    yield put(setTransactionReady());
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
  yield put(hideLoading(burnForUpDownVote.type));
}

function* burnForUpDownVoteFailureSaga(action: PayloadAction<string>) {
  yield put(
    showToast('error', {
      message: action.payload,
      duration: 3
    })
  );
  yield put(hideLoading(burnForUpDownVote.type));
}

function* updatePostBurnValue(action: PayloadAction<BurnQueueCommand>) {
  const command = action.payload;
  // @todo: better control the params for search/others
  const params = {
    orderBy: {
      direction: OrderDirection.Desc,
      field: PostOrderField.UpdatedAt
    }
  };

  const burnValue = _.toNumber(command.burnValue);

  //BUG: All token and page post show up on home page will not optimistic update becuz of PostQueryTag
  // The algo will check for PostQueryTag then updateQueryData according to it. It only update normal post not page's post and token's post at homepage.
  // That's why we need to update the all Posts here first then updateQueryData later. Not the best way to handle. Maybe come back later.
  yield put(
    postApi.util.updateQueryData('Posts', { ...params, minBurnFilter: command.minBurnFilter }, draft => {
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
        postApi.util.updateQueryData(
          'PostsByPageId',
          { ...params, id: command.pageId, minBurnFilter: command.minBurnFilter },
          draft => {
            const postToUpdateIndex = draft.allPostsByPageId.edges.findIndex(
              item => item.node.id === command.burnForId
            );
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
          }
        )
      );
    case PostsQueryTag.PostsByTokenId:
      return yield put(
        postApi.util.updateQueryData(
          'PostsByTokenId',
          { ...params, id: command.tokenId, minBurnFilter: command.minBurnFilter },
          draft => {
            const postToUpdateIndex = draft.allPostsByTokenId.edges.findIndex(
              item => item.node.id === command.burnForId
            );
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
          }
        )
      );
    case PostsQueryTag.PostsByUserId:
      return yield put(
        postApi.util.updateQueryData(
          'PostsByUserId',
          { ...params, id: command.userId, minBurnFilter: command.minBurnFilter },
          draft => {
            const postToUpdateIndex = draft.allPostsByUserId.edges.findIndex(
              item => item.node.id === command.burnForId
            );
            const postToUpdate = draft.allPostsByUserId.edges[postToUpdateIndex];
            if (postToUpdateIndex >= 0) {
              let lotusBurnUp = postToUpdate?.node?.lotusBurnUp ?? 0;
              let lotusBurnDown = postToUpdate?.node?.lotusBurnDown ?? 0;
              if (command.burnType == BurnType.Up) {
                lotusBurnUp = lotusBurnUp + burnValue;
              } else {
                lotusBurnDown = lotusBurnDown + burnValue;
              }
              const lotusBurnScore = lotusBurnUp - lotusBurnDown;
              draft.allPostsByUserId.edges[postToUpdateIndex].node.lotusBurnUp = lotusBurnUp;
              draft.allPostsByUserId.edges[postToUpdateIndex].node.lotusBurnDown = lotusBurnDown;
              draft.allPostsByUserId.edges[postToUpdateIndex].node.lotusBurnScore = lotusBurnScore;
              if (lotusBurnScore < 0) {
                draft.allPostsByUserId.edges.splice(postToUpdateIndex, 1);
                draft.allPostsByUserId.totalCount = draft.allPostsByUserId.totalCount - 1;
              }
            }
          }
        )
      );
    default:
      return yield put(
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
  }
}

function* updateCommentBurnValue(action: PayloadAction<BurnCommand>) {
  const command = action.payload;
  const { queryParams: params } = command;
  const burnValue = _.toNumber(command.burnValue);

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
  const params = {
    orderBy: {
      direction: OrderDirection.Desc,
      field: TokenOrderField.CreatedDate
    }
  };

  return yield put(
    tokenApi.util.updateQueryData('Tokens', params, draft => {
      const tokenBurnValueIndex = draft.allTokens.edges.findIndex(item => item.node.id === command.burnForId);
      const tokenBurnValue = draft.allTokens.edges[tokenBurnValueIndex];
      let lotusBurnUp = tokenBurnValue?.node?.lotusBurnUp ?? 0;
      let lotusBurnDown = tokenBurnValue?.node?.lotusBurnDown ?? 0;
      if (command.burnType == BurnType.Up) {
        lotusBurnUp = lotusBurnUp + burnValue;
      } else {
        lotusBurnDown = lotusBurnDown + burnValue;
      }
      const lotusBurnScore = lotusBurnUp - lotusBurnDown;
      draft.allTokens.edges[tokenBurnValueIndex].node.lotusBurnUp = lotusBurnUp;
      draft.allTokens.edges[tokenBurnValueIndex].node.lotusBurnDown = lotusBurnDown;
      draft.allTokens.edges[tokenBurnValueIndex].node.lotusBurnScore = lotusBurnScore;
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

function* watchCreateTxHex() {
  yield takeLatest(createTxHex.type, createTxHexSaga);
}

function* handleRequest(action) {
  try {
    yield put(setTransactionNotReady());
    yield put(burnForUpDownVote(action.payload));
  } catch (err) {
    console.log(err);
    // Dispatch a failure action with the error message
    // yield put({ type: 'USER_FETCH_FAILED', message: err.message });
  }
}

// This saga will create an action channel and use it to dispatch work to one worker saga
function* watchRequests() {
  const requestChan = yield actionChannel(addBurnTransaction, buffers.expanding(10));

  while (true) {
    // Take an action from the channel
    const transactionStatus = yield select(getTransactionStatus);
    const failQueue = yield select(getFailQueue);

    if (failQueue.length > 0) {
      yield flush(requestChan);
    }

    if (transactionStatus) {
      const action = yield take(requestChan);

      yield call(handleRequest, action);
    } else {
      yield take(setTransactionReady.type);
    }
  }
}

export default function* burnSaga() {
  if (typeof window === 'undefined') {
    yield all([
      fork(watchCreateTxHex),
      fork(watchBurnForUpDownVote),
      fork(watchBurnForUpDownVoteSuccess),
      fork(watchBurnForUpDownVoteFailure)
    ]);
  } else {
    yield all([
      fork(watchRequests),
      fork(watchCreateTxHex),
      fork(watchBurnForUpDownVote),
      fork(watchBurnForUpDownVoteSuccess),
      fork(watchBurnForUpDownVoteFailure)
    ]);
  }
}
