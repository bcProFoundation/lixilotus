import { createSelector } from 'reselect';

import { RootState } from '../store';

import { WebPushNotifConfig } from './model';
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

export const getWebAuthnConfig = createSelector(
  (state: RootState) => state.settings,
  (state: SettingsState) => state.webAuthnConfig
);

export const getFilterPostsHome = createSelector(
  (state: RootState) => state.settings,
  (state: SettingsState) => state.filterPostsHome
);

export const getFilterPostsPage = createSelector(
  (state: RootState) => state.settings,
  (state: SettingsState) => state.filterPostsPage
);

export const getFilterPostsToken = createSelector(
  (state: RootState) => state.settings,
  (state: SettingsState) => state.filterPostsToken
);

export const getWebPushNotifConfig = createSelector(
  (state: RootState) => state.settings,
  (state: SettingsState) => state.webPushNotifConfig
);

export const getFilterPostsProfile = createSelector(
  (state: RootState) => state.settings,
  (state: SettingsState) => state.filterPostsProfile
);

export const getDeviceId = createSelector(
  getWebPushNotifConfig,
  (state: WebPushNotifConfig) =>
    state && state.deviceId ? state.deviceId : undefined
);

export const getCurrentThemes = createSelector(
  (state: RootState) => state.settings,
  (state: SettingsState) => state.darkThemes
);

export const getIsTopPosts = createSelector(
  (state: RootState) => state.settings,
  (state: SettingsState) => state.isTopPosts
);
