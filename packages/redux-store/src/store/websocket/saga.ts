import { AccountDto, NotificationDto as Notification } from '@bcpros/lixi-models';
import { NOTIFICATION_TYPES } from '@bcpros/lixi-models/constants';
import { SessionAction, SessionActionEnum } from '@bcpros/lixi-models/lib/sessionAction';
import { callConfig } from '@context/shareContext';
import { PageMessageSession } from '@generated/types.generated';
import { getAccountById, getSelectedAccount } from '@store/account/selectors';
import { setPageMessageSession } from '@store/page/action';
import { setNewPostAvailable } from '@store/post/actions';
import { eventChannel } from 'redux-saga';
import { all, call, fork, put, put as putAction, race, select, take, takeLatest } from 'redux-saga/effects';
import { Socket } from 'socket.io-client';
import { downloadExportedLixi, refreshLixiSilent } from '../lixi/actions';
import { api as messageApi } from '../message/message.api';
import { api as pageMessageApi } from '../message/pageMessageSession.api';
import { receiveNotification } from '../notification/actions';
import { upsertPageMessageSession } from '@store/message';
import { showToast } from '../toast/actions';
import { connectToChannels } from './actions';

function createMessageSocketChannel(socket: Socket) {
  return eventChannel(emit => {
    const handler = (data: string) => {
      emit(data);
    };
    socket.on('publishMessage', handler);
    return () => {
      socket.off('publishMessage', handler);
    };
  });
}

function createAddressSocketChannel(socket: Socket) {
  return eventChannel(emit => {
    const handler = (data: string) => {
      emit(data);
    };
    socket.on('publishAddressChannel', handler);
    return () => {
      socket.off('publishAddressChannel', handler);
    };
  });
}

function createSessionActionSocketChannel(socket: Socket) {
  return eventChannel(emit => {
    const handler = (data: string) => {
      emit(data);
    };
    socket.on('sessionAction', handler);
    return () => {
      socket.off('sessionAction', handler);
    };
  });
}

function createNotificationSocketChannel(socket: Socket) {
  return eventChannel(emit => {
    const handler = (data: Notification) => {
      emit(data);
    };
    socket.on('notification', handler);
    return () => {
      socket.off('notification', handler);
    };
  });
}

// WebSocket Saga
function* connectToChannelsSaga() {
  const socket = callConfig.call.socketContext;
  const socketMessageChannel = yield call(createMessageSocketChannel, socket);
  const socketAddressChannel = yield call(createAddressSocketChannel, socket);
  const sessionActionSocketChannel = yield call(createSessionActionSocketChannel, socket);
  const notificationSocketChannel = yield call(createNotificationSocketChannel, socket);

  while (true) {
    const { message, payload, sessionAction, notification } = yield race({
      message: take(socketMessageChannel),
      payload: take(socketAddressChannel),
      sessionAction: take(sessionActionSocketChannel),
      notification: take(notificationSocketChannel)
    });

    if (message) {
      yield receiveLiveMessage(message);
    }

    if (payload) {
      yield receiveNewMessage(payload);
    }

    if (sessionAction) {
      yield receiveSessionAction(sessionAction);
    }

    if (notification) {
      yield receiveNewNotification(notification);
    }
  }
}

function* receiveLiveMessage(payload: any) {
  const { pageMessageSessionId, body, updatedAt, author } = payload;
  const account: AccountDto = yield select(getSelectedAccount);

  try {
    yield putAction(
      messageApi.util.updateQueryData('MessageByPageMessageSessionId', { id: pageMessageSessionId }, draft => {
        draft.allMessageByPageMessageSessionId.edges.unshift({
          cursor: payload.id,
          node: {
            ...payload
          }
        });
        draft.allMessageByPageMessageSessionId.totalCount = draft.allMessageByPageMessageSessionId.totalCount + 1;
      })
    );
    yield putAction(
      pageMessageApi.util.updateQueryData('PageMessageSessionByAccountId', { id: account.id }, draft => {
        const index = draft.allPageMessageSessionByAccountId.edges.findIndex(
          edge => edge.node.id === pageMessageSessionId
        );

        const object = draft.allPageMessageSessionByAccountId.edges.find(edge => edge.node.id === pageMessageSessionId);

        if (index > -1) {
          draft.allPageMessageSessionByAccountId.edges.splice(index, 1);
          draft.allPageMessageSessionByAccountId.edges.unshift({
            cursor: object.cursor,
            node: {
              ...object.node,
              latestMessage: {
                id: payload.id,
                body: body,
                author: author
              },
              updatedAt: updatedAt
            }
          });
        }
      })
    );
  } catch (error) {
    console.log('error', error.message);
  }
}

function* receiveNewMessage(payload: PageMessageSession) {
  const { id, page } = payload;
  const account: AccountDto = yield select(getSelectedAccount);
  // subcribe to new message session
  const socket = callConfig.call.socketContext;
  socket.emit('subscribePageMessageSession', id);

  try {
    yield putAction(
      pageMessageApi.util.updateQueryData('PageMessageSessionByAccountId', { id: account.id }, draft => {
        draft.allPageMessageSessionByAccountId.edges.unshift({
          cursor: id,
          node: {
            ...payload
          }
        });
        draft.allPageMessageSessionByAccountId.totalCount = draft.allPageMessageSessionByAccountId.totalCount + 1;
      })
    );
  } catch (error) {
    console.log('error', error.message);
  }
}

function* receiveSessionAction(action: SessionAction) {
  console.log(action);
  const { payload, type }: { payload: PageMessageSession; type: SessionActionEnum } = action;
  const pageAccount: AccountDto = yield select(getAccountById(payload.page.pageAccountId));
  const account: AccountDto = yield select(getSelectedAccount);

  switch (type) {
    case SessionActionEnum.OPEN:
      try {
        yield put(setPageMessageSession(payload));
        yield putAction(
          pageMessageApi.util.updateQueryData('PageMessageSessionByAccountId', { id: account.id }, draft => {
            const index = draft.allPageMessageSessionByAccountId.edges.findIndex(edge => edge.node.id === payload.id);

            const object = draft.allPageMessageSessionByAccountId.edges.find(edge => edge.node.id === payload.id);

            if (index > -1) {
              draft.allPageMessageSessionByAccountId.edges.splice(index, 1);
            }
            draft.allPageMessageSessionByAccountId.edges.unshift({
              cursor: object.cursor,
              node: {
                ...payload
              }
            });
          })
        );
      } catch (error) {
        console.log('error', error.message);
      }
      break;
    case SessionActionEnum.CLOSE:
      try {
        yield put(setPageMessageSession(payload));
        yield putAction(
          pageMessageApi.util.updateQueryData('PageMessageSessionByAccountId', { id: account.id }, draft => {
            const index = draft.allPageMessageSessionByAccountId.edges.findIndex(edge => edge.node.id === payload.id);
            if (index > -1) {
              draft.allPageMessageSessionByAccountId.edges.splice(index, 1);
            }
          })
        );
      } catch (error) {
        console.log('error', error.message);
      }
      break;
  }
}

function* receiveNewNotification(payload: Notification) {
  try {
    const { message, notificationTypeId, additionalData } = payload;
    const { parentId, mnemonicHash, fileName, id } = additionalData as any;

    switch (notificationTypeId) {
      case NOTIFICATION_TYPES.NEW_POST:
        yield put(setNewPostAvailable(true));
        break;
      case NOTIFICATION_TYPES.CREATE_SUB_LIXIES:
        yield put(refreshLixiSilent(id));
        break;
      case NOTIFICATION_TYPES.EXPORT_SUB_LIXIES:
        yield put(downloadExportedLixi({ lixiId: parentId, mnemonicHash, fileName }));
        break;
    }

    if (message) {
      yield put(
        showToast('info', {
          message: 'Info',
          description: message,
          duration: 5
        })
      );

      yield put(receiveNotification(payload));
    }
  } catch (error) {
    console.log('error', error.message);
  }
}

function* watchConnectToChannels() {
  yield takeLatest(connectToChannels.type, connectToChannelsSaga);
}

export function* websocketSaga() {
  if (typeof window === 'undefined') {
    yield all([]);
  } else {
    yield all([fork(watchConnectToChannels)]);
  }
}
