import { AccountDto, EditPageCommand, Page, PageDto } from '@bcpros/lixi-models';
import { CreatePageCommand } from '@bcpros/lixi-models/src';
import { all, fork, put, takeLatest, call } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import * as _ from 'lodash';
import { api as webpushApi } from './webpush.api';
import intl from 'react-intl-universal';
import * as Effects from 'redux-saga/effects';
import { webpushSubscribe } from './actions';
import { WebpushSubscribe } from './model';
import { CreateWebpushSubscriberInput } from 'src/generated/types.generated';


function* watchWebpushSubscribe() {
  yield takeLatest(webpushSubscribe.type, webpushSubscribeSaga);
}

const settle = (fn, ...args) =>
  call(function* () {
    try {
      return { status: "fulfilled", value: yield call(fn, ...args) };
    } catch (err) {
      return { status: "rejected", reason: err };
    }
  });

function* createSubscriber(input: CreateWebpushSubscriberInput) {
  const promise = yield put(webpushApi.endpoints.CreateWebpushSubscriber.initiate({
    input: input
  }));

  yield promise;

  const data = yield promise.unwrap();

  return data;
}

function* webpushSubscribeSaga(action: PayloadAction<WebpushSubscribe>) {
  const results = yield all(
    action.payload.subscribers.map((subscriber: CreateWebpushSubscriberInput) => {
      settle(createSubscriber, subscriber);
    })
  )

  const zipped = _.zip(results, action.payload.subscribers);
}

export default function* webpushSaga() {
  yield all([
    fork(watchWebpushSubscribe)
  ]);
}