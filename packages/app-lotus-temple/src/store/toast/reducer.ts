import { createReducer } from '@reduxjs/toolkit';
import _ from 'lodash';
import { showToast } from './actions';
import { ToastState } from './state';

const initialState: ToastState = {
  type: 'success',
  config: null
};

export const toastReducer = createReducer(initialState, builder => {
  builder.addCase(showToast, (state, action) => {
    const { type, config } = action.payload;
    state.type = type;
    state.config = config as any;
  });
});
