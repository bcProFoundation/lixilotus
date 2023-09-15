import { PayloadAction } from '@reduxjs/toolkit';
import { take, takeEvery, put, select, fork, delay, race, all } from 'redux-saga/effects';
import { analyticEvent, batchEvents, cancelBatch } from './actions';
import { AnalyticEvent } from '@bcpros/lixi-models';
import { callConfig } from '@context/shareContext';

function* batchEventsSaga(action: PayloadAction<AnalyticEvent[]>) {
  const socket = callConfig.call.socketContext;
  const { payload } = action;
  if (payload && payload.length > 0) {
    socket.emit('analyticEvents', payload);
  }
}

function* watchBatchAnalyticEvents() {
  yield takeEvery(batchEvents, batchEventsSaga);
}

function* watchAnalyticEvent(actionType, duration) {
  const pendingActions = [];
  let timer;

  while (true) {
    const action = yield take(actionType);
    const { payload } = action;
    pendingActions.push(payload);

    if (!timer) {
      timer = yield fork(function* () {
        while (true) {
          const { cancel, continueTimer } = yield race({
            cancel: take(cancelBatch), // Replace with your cancel action type
            continueTimer: delay(duration)
          });

          if (cancel) {
            pendingActions.length = 0; // Clear pending actions if canceled
            timer = null;
            break;
          }

          if (continueTimer) {
            const batchedActions = [...pendingActions];
            pendingActions.length = 0;
            yield put(batchEvents(batchedActions));
            timer = null;
            break;
          }
        }
      });
    }
  }
}

export default function* analyticEventSaga() {
  yield all([watchAnalyticEvent(analyticEvent.type, 1000), fork(watchBatchAnalyticEvents)]);
}
