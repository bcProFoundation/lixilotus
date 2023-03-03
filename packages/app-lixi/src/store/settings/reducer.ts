import { createReducer } from '@reduxjs/toolkit';
import { saveFilterBurn, saveWebAuthnConfig, setInitIntlStatus, toggleCollapsedSideNav, updateLocale } from './actions';
import { SettingsState } from './state';
import { FilterType } from '@bcpros/lixi-models/lib/filter';

const initialState: SettingsState = {
  navCollapsed: true,
  locale: 'en',
  initIntlStatus: false,
  webAuthnConfig: null,
  filterPostsHome: 0,
  filterPostsPage: 0,
  filterPostsToken: 0
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
    .addCase(saveFilterBurn, (state, action) => {
      const { filterForType, filterValue } = action.payload;
      switch (filterForType) {
        case FilterType.postsHome:
          state.filterPostsHome = filterValue;
          break;
        case FilterType.postsPage:
          state.filterPostsPage = filterValue;
          break;
        case FilterType.postsToken:
          state.filterPostsToken = filterValue;
          break;
      }
    });
});
