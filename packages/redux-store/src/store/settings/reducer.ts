import { FilterType } from '@bcpros/lixi-models/lib/filter';
import { createReducer } from '@reduxjs/toolkit';

import {
  saveAllowPushNotification,
  saveBurnFilter,
  saveWebAuthnConfig,
  saveWebPushNotifConfig,
  setInitIntlStatus,
  toggleCollapsedSideNav,
  updateLocale
} from './actions';
import { SettingsState } from './state';

const initialState: SettingsState = {
  navCollapsed: true,
  locale: 'en',
  initIntlStatus: false,
  webAuthnConfig: null,
  webPushNotifConfig: {
    allowPushNotification: false,
    deviceId: null
  },
  filterPostsHome: 10,
  filterPostsPage: 10,
  filterPostsToken: 1,
  filterPostsProfile: 1
};

export const settingsReducer = createReducer(initialState, builder => {
  builder
    .addCase(toggleCollapsedSideNav, (state, action) => {
      state.navCollapsed = action.payload;
    })
    .addCase(updateLocale, (state, action) => {
      state.locale = action.payload;
    })
    .addCase(setInitIntlStatus, (state, action) => {
      state.initIntlStatus = action.payload;
    })
    .addCase(saveWebAuthnConfig, (state, action) => {
      state.webAuthnConfig = action.payload;
    })
    .addCase(saveWebPushNotifConfig, (state, action) => {
      state.webPushNotifConfig = action.payload;
    })
    .addCase(saveAllowPushNotification, (state, action) => {
      state.webPushNotifConfig.allowPushNotification = action.payload;
    })
    .addCase(saveBurnFilter, (state, action) => {
      const { filterForType, filterValue } = action.payload;
      switch (filterForType) {
        case FilterType.PostsHome:
          state.filterPostsHome = filterValue;
          break;
        case FilterType.PostsPage:
          state.filterPostsPage = filterValue;
          break;
        case FilterType.PostsToken:
          state.filterPostsToken = filterValue;
          break;
        case FilterType.PostsProfile:
          state.filterPostsProfile = filterValue;
          break;
      }
    });
});
