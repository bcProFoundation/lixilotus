import { eventChannel } from 'redux-saga';
import { all, call, fork, put, race, select, take, takeEvery, takeLatest } from 'redux-saga/effects';
import { connectWebSocket } from './websocketUtils'; // Implement this function
import { io, Socket } from 'socket.io-client';
import { SessionAction, SessionActionEnum } from '@bcpros/lixi-models/lib/sessionAction';
import { AccountDto, NotificationDto as Notification, SocketUser } from '@bcpros/lixi-models';
import { getAccountById, getSelectedAccount } from '@store/account/selectors';
import { put as putAction } from 'redux-saga/effects';
import { api as pageMessageApi } from '../message/pageMessageSession.api';
import { api as messageApi } from '../message/message.api';
import { PageMessageSession } from '@generated/types.generated';
import { setPageMessageSession } from '@store/page/action';
import { connectToChannels, wsConnect } from './actions';
import { PayloadAction } from '@reduxjs/toolkit';
import { downloadExportedLixi, refreshLixiSilent } from '../lixi/actions';
import { setNewPostAvailable } from '@store/post/actions';
import { showToast } from '../toast/actions';
import { callConfig } from '@context/shareContext';

const NOTIFICATION_TYPES = {
  CREATE_SUB_LIXIES: 1,
  WITHDRAW_SUB_LIXIES: 2,
  EXPORT_SUB_LIXIES: 3,
  NEW_POST: 14
};

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
      console.log('🚀 ~ file: saga.ts:172 ~ function*listenServerSaga ~ sessionAction:', sessionAction);
      yield receiveSessionAction(sessionAction);
    }

    if (notification) {
      console.log('🚀 ~ file: saga.ts:172 ~ function*listenServerSaga ~ sessionAction:', notification);
      yield receiveNotification(notification);
    }
  }
}

function* receiveLiveMessage(payload: any) {
  const { pageMessageSessionId, body } = payload;
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
              latestMessage: body
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
  console.log(payload);
  const { id, page } = payload;
  const account: AccountDto = yield select(getSelectedAccount);

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
                ...object.node
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

function* receiveNotification(action: PayloadAction<Notification>) {
  try {
    const { message, notificationTypeId, additionalData } = action.payload;
    if (notificationTypeId == NOTIFICATION_TYPES.CREATE_SUB_LIXIES) {
      const { id } = additionalData as any;
      yield put(refreshLixiSilent(id));
    } else if (notificationTypeId == NOTIFICATION_TYPES.EXPORT_SUB_LIXIES) {
      const { parentId, mnemonicHash, fileName } = additionalData as any;
      yield put(downloadExportedLixi({ lixiId: parentId, mnemonicHash, fileName }));
    } else if (notificationTypeId === NOTIFICATION_TYPES.NEW_POST) {
      yield put(setNewPostAvailable(true));
    }

    if (message) {
      yield put(
        showToast('info', {
          message: 'Info',
          description: message,
          duration: 5
        })
      );
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
