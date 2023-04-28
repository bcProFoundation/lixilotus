import { FilterType } from '@bcpros/lixi-models/lib/filter';
import { createReducer } from '@reduxjs/toolkit';

import { saveBurnFilter, saveWebAuthnConfig, setInitIntlStatus, toggleCollapsedSideNav, updateLocale } from './actions';
import { SettingsState } from './state';

const initialState: SettingsState = {
  navCollapsed: true,
  locale: 'en',
  initIntlStatus: false,
  webAuthnConfig: null,
  filterPostsHome: 1,
  filterPostsPage: 1,
  filterPostsToken: 1
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
