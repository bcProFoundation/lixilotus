import { createSelector } from 'reselect';

import { RootState } from '../store';

import { ToastState } from './state';

export const getToastNotification = createSelector(
  (state: RootState) => state.toast,
  (state: ToastState) => state
);
