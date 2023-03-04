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
import { actionChannel, select, put, getContext } from 'redux-saga/effects';
import { OrderDirection, PostOrderField } from 'src/generated/types.generated';
import { hideLoading } from '../loading/actions';
import {
  burnForUpDownVote,
  burnForUpDownVoteFailure,
  burnForUpDownVoteSuccess,
  burning,
  doneBurning,
  createTxHex
} from './actions';
import burnApi from './api';
import { PostsQueryTag } from '@bcpros/lixi-models/constants';
import { getSlpBalancesAndUtxos } from '@store/wallet';
import { setTransactionNotReady, setTransactionReady } from '@store/account/actions';
import { getTransactionStatus } from '@store/account/selectors';
import { getAllWalletPaths } from '@store/wallet';
import { callConfig } from '@context/shareContext';

function* createTxHexSaga(action: any) {
  const data = action.payload;
  const { XPI } = callConfig.call.walletContext;
  const xpiContext = yield getContext('useXPI');
  const walletPaths = yield select(getAllWalletPaths);
  const slpBalancesAndUtxos = yield select(getSlpBalancesAndUtxos);
  const { createBurnTransaction } = xpiContext();

  const txHex = createBurnTransaction(
    XPI,
    walletPaths,
    slpBalancesAndUtxos.nonSlpUtxos,
    data.defaultFee,
    data.burnType,
    data.burnForType,
    data.burnedBy,
    data.burnForId,
    data.burnValue,
    data.tipToAddresses
  );

  yield put({ type: 'CREATE_TX_HEX', payload: txHex });
  // yield put(setLatestTxHex(txHex))
}

function* burnForUpDownVoteSaga(action: PayloadAction<BurnCommand>) {
  let patches, patch: PatchCollection;
  const command = action.payload;
  yield put(burning(command));

  const { burnForId: postId, queryParams } = command;
  let burnValue = _.toNumber(command.burnValue);
  yield put(createTxHex(command));
  const { payload } = yield take('CREATE_TX_HEX');
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

    // if (command.burnForType === BurnForType.Token) {
    //   yield put(burnForTokenSucceses());
    // }

    if (_.isNil(data) || _.isNil(data.id)) {
      throw new Error(intl.get('post.unableToBurnForPost'));
    }

    yield put(burnForUpDownVoteSuccess(data));
    yield put(doneBurning());
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
  yield put(hideLoading(burnForUpDownVote.type));
}

function* burnForUpDownVoteFailureSaga(action: PayloadAction<string>) {
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

function* burningSaga(action) {
  const command = action.payload;
  yield put(
    showToast('burn', {
      key: 'burning',
      message: `Burning for ${command.burnValue} XPI`
    })
  );
}

function* doneBurningSaga(action) {
  yield put(
    showToast('success', {
      key: 'burning',
      message: 'Burn Success',
      duration: 2
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

function* watchBurning() {
  yield takeLatest(burning.type, burningSaga);
}

function* watchDoneBurning() {
  yield takeLatest(doneBurning.type, doneBurningSaga);
}

function* watchCreateTxHex() {
  yield takeLatest(createTxHex.type, createTxHexSaga);
}
// function* watchBurnForUpDownVoteChannel() {
//   // 1- Create a channel for request actions
//   const burnChannel = yield actionChannel(burnForUpDownVote.type);
//   while (true) {
//     // 2- take from the channel

//     const action = yield take(burnChannel);

//     // 3- Note that we're using a blocking call
//     yield call(burnForUpDownVoteSaga, action);
//   }
// }

// function* startStopBurnChannel() {
//   while (true) {
//     yield take(startBurnChannel.type);
//     yield race([yield call(createBurnChannelSaga)]);
//   }
// }

function* handleRequest(action) {
  try {
    // Call the API to fetch the user data
    // const transactionStatus = yield select(getTransactionStatus);
    // console.log('handle request, transactionStatus: ', transactionStatus)
    yield put(setTransactionNotReady());

    yield put(burnForUpDownVote(action.payload));

    // // if(!transactionStatus) return;
    // console.log('mock api')
    // const user = yield call(burnApi.mock, action.payload)
    // // Dispatch a success action with the user data
    // yield put({ type: 'USER_FETCH_SUCCEEDED', user })
  } catch (err) {
    // Dispatch a failure action with the error message
    yield put({ type: 'USER_FETCH_FAILED', message: err.message });
  }
}

// This saga will create an action channel and use it to dispatch work to one worker saga
function* watchRequests() {
  // Create a channel for USER_REQUESTED actions
  const requestChan = yield actionChannel('USER_REQUESTED');

  while (true) {
    // Take an action from the channel
    const transactionStatus = yield select(getTransactionStatus);
    console.log('transactionStatus', transactionStatus);
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
      fork(watchBurning),
      fork(watchDoneBurning),
      fork(watchBurnForUpDownVote),
      // fork(watchBurnForUpDownVoteChannel),
      fork(watchBurnForUpDownVoteSuccess),
      fork(watchBurnForUpDownVoteFailure)
    ]);
  } else {
    yield all([
      fork(watchRequests),
      fork(watchCreateTxHex),
      fork(watchDoneBurning),
      fork(watchBurnForUpDownVote),
      fork(watchBurning),
      // fork(watchBurnForUpDownVoteChannel),
      fork(watchBurnForUpDownVoteSuccess),
      fork(watchBurnForUpDownVoteFailure)
    ]);
  }
}
