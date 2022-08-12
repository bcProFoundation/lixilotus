import { createSelector } from 'reselect';
import { RootState } from '../store';
import { SettingsState } from './state';

export const getNavCollapsed = createSelector(
  (state: RootState) => state.settings,
  (state: SettingsState) => state.navCollapsed
);

export const getCurrentLocale = createSelector(
  (state: RootState) => state.settings,
  (state: SettingsState) => state.locale
);

export const getIntlInitStatus = createSelector(
  (state: RootState) => state.settings,
  (state: SettingsState) => state.initIntlStatus
);
