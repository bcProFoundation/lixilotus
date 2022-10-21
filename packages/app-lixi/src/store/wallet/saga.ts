import * as _ from 'lodash';
import intl from 'react-intl-universal';
import { all, call, fork, put, select, takeLatest } from '@redux-saga/core/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { getSelectedAccount } from '@store/account/selectors';
import { changeAccountLocale } from '@store/account/actions';

export default function* walletSaga() {
  yield all([]);
}
