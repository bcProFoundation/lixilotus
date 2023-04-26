import { createReducer } from '@reduxjs/toolkit';

import { hideLoading, showLoading } from './actions';
import { LoadingState } from './state';

const initialState: LoadingState = {
  global: false,
  models: {},
  effects: {}
};

export const loadingReducer = createReducer(initialState, builder => {
  builder
    .addCase(showLoading, (state, action) => {
      const modelAndEffect = action.payload.split('/');
      if (modelAndEffect.length == 2) {
        const model = modelAndEffect[0];
        const effect = modelAndEffect[1];
        if (state.effects.models === undefined) {
          state.effects[model] = {};
        }
        state.effects[model][effect] = true;
        state.models[model] = true;
        state.global = true;
      }
    })
    .addCase(hideLoading, (state, action) => {
      const modelAndEffect = action.payload.split('/');
      if (modelAndEffect.length == 2) {
        const model = modelAndEffect[0];
        const effect = modelAndEffect[1];
        if (state.effects.models === undefined) {
          state.effects[model] = {};
        }
        state.effects[model][effect] = false;
        if (!Object.values(state.effects[model]).some(e => e === true)) {
          state.models[model] = false;
        }
        if (!Object.values(state.models).some(m => m === true)) {
          state.global = false;
        }
      }
    });
});
