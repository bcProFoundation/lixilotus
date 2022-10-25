import { all } from 'redux-saga/effects';

import accountSaga from './account/saga';
import localAccountSaga from './localAccount/saga';
import lixiSaga from './lixi/saga';
import claimSaga from './claim/saga';
import envelopeSaga from './envelope/saga';
import toastSaga from './toast/saga';
import settingsSaga from './settings/saga';
import notificationSaga from './notification/saga';
import sendSaga from './send/saga';
import pageSaga from './page/saga';
import countrySaga from './country/saga';
import walletSaga from './wallet/saga';
import postSaga from './post/saga';

export default function* rootSaga() {
  yield all([
    walletSaga(),
    accountSaga(),
    localAccountSaga(),
    lixiSaga(),
    sendSaga(),
    claimSaga(),
    envelopeSaga(),
    toastSaga(),
    settingsSaga(),
    notificationSaga(),
    pageSaga(),
    postSaga(),
    countrySaga()
  ]);
}
