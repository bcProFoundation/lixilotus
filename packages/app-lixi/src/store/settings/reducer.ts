import { createReducer } from "@reduxjs/toolkit"
import { toggleCollapsedSideNav } from './actions';
import { SettingsState } from "./state";

const initialState: SettingsState = {
  navCollapsed: true
};

export const settingsReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(toggleCollapsedSideNav, (state, action) => {
      state.navCollapsed = action.payload;
    })
})