import { createSelector } from 'reselect';

import { RootState } from '../store';

import { ActionSheetState } from './state';

export const getActionSheet = createSelector(
  (state: RootState) => state.actionSheet,
  (state: ActionSheetState) => state.actionSheets
);
