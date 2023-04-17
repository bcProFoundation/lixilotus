import * as _ from 'lodash';
import intl from 'react-intl-universal';
import { all, call, fork, put, select, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { loadLocale, loadLocaleFailure, loadLocaleSuccess, setInitIntlStatus, updateLocale } from './actions';
import AppLocale from 'src/lang';
import { showToast } from '@store/toast/actions';
import { Account, ChangeAccountLocaleCommand } from '@bcpros/lixi-models';
import { getSelectedAccount } from '@store/account/selectors';
import { changeAccountLocale } from '@store/account/actions';
import { FilterBurnCommand } from '@bcpros/lixi-models/lib/filter';
import moment from 'moment';
import 'moment/locale/vi';

function initLocale(currentAppLocale: any): Promise<boolean> {
  return intl
    .init({
      currentLocale: currentAppLocale.locale,
      locales: {
        [currentAppLocale.locale]: currentAppLocale.messages
      }
    })
    .then(() => {
      return true;
    })
    .catch(err => {
      return false;
    });
}

function* loadLocaleSaga(action: PayloadAction<string>) {
  try {
    const language: string = action.payload ?? 'en';
    const currentAppLocale = AppLocale[language];
    const initDone: boolean = yield call(initLocale, currentAppLocale);
    const selectedAccount: Account | undefined = yield select(getSelectedAccount);

    moment.updateLocale(moment.locale(language), {
      relativeTime: {
        dd: function (num) {
          if (num > 2) {
            return moment().subtract(num, 'days').format('MMMM Do YYYY');
          } else {
            return '%d days';
          }
        },
        M: function (num) {
          if (num <= 1) {
            return moment().subtract(num, 'months').format('MMMM Do YYYY');
          }
        },
        MM: function (num) {
          if (num <= 1) {
            return moment().subtract(num, 'months').format('MMMM Do YYYY');
          }
        },
        y: function (num) {
          if (num <= 1) {
            return moment().subtract(num, 'years').format('MMMM Do YYYY');
          }
        },
        yy: function (num) {
          if (num <= 1) {
            return moment().subtract(num, 'years').format('MMMM Do YYYY');
          }
        }
      }
    });

    if (initDone) {
      yield put(loadLocaleSuccess());
    } else {
      yield put(loadLocaleFailure(loadLocale.type));
    }
  } catch {
    yield put(loadLocaleFailure(loadLocale.type));
  }
}

function* updateLocaleSaga(action: PayloadAction<string>) {
  try {
    const language: string = action.payload ?? 'en';
    const selectedAccount: Account | undefined = yield select(getSelectedAccount);

    const command: ChangeAccountLocaleCommand = {
      id: selectedAccount.id,
      mnemonic: selectedAccount.mnemonic,
      language: language
    };
    yield put(changeAccountLocale(command));
  } catch {
    yield put(loadLocaleFailure(updateLocale.type));
  }
}

function* loadLocaleSuccessSaga() {
  try {
    yield put(setInitIntlStatus(true));
  } catch (error) {
    const message = `There's an error happens change language.`;
    yield put(loadLocaleFailure(message));
  }
}

function* loadLocaleFailureSaga(action: PayloadAction<string>) {
  yield put(setInitIntlStatus(true));
  const message = action.payload ?? 'Unable to change language';
  yield put(
    showToast('error', {
      message: 'Error',
      description: message,
      duration: 5
    })
  );
}

function* watchLoadLocale() {
  yield takeLatest(loadLocale.type, loadLocaleSaga);
}

function* watchUpdateLocale() {
  yield takeLatest(updateLocale.type, updateLocaleSaga);
}

function* watchLoadLocaleSuccess() {
  yield takeLatest(loadLocaleSuccess.type, loadLocaleSuccessSaga);
}

function* watchLoadLocaleFailuare() {
  yield takeLatest(loadLocaleFailure.type, loadLocaleFailureSaga);
}

export default function* lixiSaga() {
  yield all([
    fork(watchLoadLocale),
    fork(watchLoadLocaleSuccess),
    fork(watchLoadLocaleFailuare),
    fork(watchUpdateLocale)
  ]);
}
