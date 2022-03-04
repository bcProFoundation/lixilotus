import { createSelector } from "reselect";
import { RootState } from "../store";
import { SettingsState } from "./state";

export const getNavCollapsed = createSelector(
  (state: RootState) => state.settings,
  (state: SettingsState) => state.navCollapsed
);