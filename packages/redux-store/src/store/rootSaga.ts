import { all } from 'redux-saga/effects';

import accountSaga from './account/saga';
import burnSaga from './burn/saga';
import categorySaga from './category/saga';
import claimSaga from './claim/saga';
import countrySaga from './country/saga';
import envelopeSaga from './envelope/saga';
import lixiSaga from './lixi/saga';
import localAccountSaga from './localAccount/saga';
import notificationSaga from './notification/saga';
import pageSaga from './page/saga';
import postSaga from './post/saga';
import sendSaga from './send/saga';
import settingsSaga from './settings/saga';
import tokenSaga from './token/saga';
import walletSaga from './wallet/saga';
import worshipSaga from './worship/saga';
import webpushSaga from './webpush/saga';

export default function* rootSaga() {
  yield all([
    walletSaga(),
    accountSaga(),
    localAccountSaga(),
    lixiSaga(),
    sendSaga(),
    claimSaga(),
    envelopeSaga(),
    settingsSaga(),
    notificationSaga(),
    webpushSaga(),
    worshipSaga(),
    pageSaga(),
    postSaga(),
    countrySaga(),
    tokenSaga(),
    burnSaga(),
    categorySaga()
  ]);
}
