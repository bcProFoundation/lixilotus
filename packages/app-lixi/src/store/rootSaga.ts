import { all } from 'redux-saga/effects';

import accountSaga from './account/saga';
import lixiSaga from './lixi/saga';
import claimSaga from './claim/saga';
import envelopeSaga from './envelope/saga';
import toastSaga from './toast/saga';
import settingsSaga from './settings/saga';
import notificationSaga from './notification/saga';
import pageSaga from './page/saga';

export default function* rootSaga() {
  yield all([
    accountSaga(),
    lixiSaga(),
    claimSaga(),
    envelopeSaga(),
    toastSaga(),
    settingsSaga(),
    notificationSaga(),
    pageSaga()
  ]);
}
