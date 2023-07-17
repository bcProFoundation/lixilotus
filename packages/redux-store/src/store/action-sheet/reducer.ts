import { createReducer } from '@reduxjs/toolkit';

import { closeActionSheet, openActionSheet } from './actions';
import { ActionSheetState } from './state';

const initialState: ActionSheetState = {
  actionSheets: []
};

export const actionSheetReducer = createReducer(initialState, builder => {
  builder
    .addCase(openActionSheet, (state, action) => {
      const { actionSheetType, actionSheetProps } = action.payload;

      state.actionSheets.push({
        actionSheetType,
        actionSheetProps
      });
    })
    .addCase(closeActionSheet, (state, action) => {
      state.actionSheets.pop();
    });
});
