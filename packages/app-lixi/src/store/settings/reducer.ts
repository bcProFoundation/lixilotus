import { createReducer } from '@reduxjs/toolkit';
import { saveWebAuthnConfig, setInitIntlStatus, toggleCollapsedSideNav, updateLocale } from './actions';
import { SettingsState } from './state';

const initialState: SettingsState = {
  navCollapsed: true,
  locale: 'en',
  initIntlStatus: false,
  webAuthnConfig: null
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
    });
});
