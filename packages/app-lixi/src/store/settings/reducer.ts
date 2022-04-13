import { createReducer } from "@reduxjs/toolkit"
import { setInitIntlStatus, toggleCollapsedSideNav, updateLocale } from './actions';
import { SettingsState } from "./state";

const initialState: SettingsState = {
  navCollapsed: true,
  locale: 'en',
  initIntlStatus: true
};

export const settingsReducer = createReducer(initialState, (builder) => {
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
})