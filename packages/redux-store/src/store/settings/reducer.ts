import { FilterType } from '@bcpros/lixi-models/lib/filter';
import { createReducer } from '@reduxjs/toolkit';

import {
  saveAllowPushNotification,
  saveBurnFilter,
  saveTopPostsFilter,
  saveWebAuthnConfig,
  saveWebPushNotifConfig,
  setCurrentThemes,
  setInitIntlStatus,
  setIsSystemThemes,
  toggleCollapsedSideNav,
  updateLocale,
  setLanguageNotAutoTrans
} from './actions';
import { SettingsState } from './state';
// import { SearchBoxType } from '@bcpros/lixi-models/src/lib/search';

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
  filterPostsPage: 0,
  filterPostsToken: 1,
  filterPostsProfile: 1,
  isTopPosts: false,
  currentThemes: 'system',
  isSystemThemes: true,
  languageNotAutoTrans: null
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
    })
    .addCase(saveTopPostsFilter, (state, action) => {
      state.isTopPosts = action.payload;
    })
    .addCase(setCurrentThemes, (state, action) => {
      state.currentThemes = action.payload;
    })
    .addCase(setIsSystemThemes, (state, action) => {
      state.isSystemThemes = action.payload;
    })
    .addCase(setLanguageNotAutoTrans, (state, action) => {
      state.languageNotAutoTrans = action.payload;
    });
});
