import { BurnForType } from '@bcpros/lixi-models';
import { createReducer } from '@reduxjs/toolkit';
import { burnForUpDownVoteSuccess } from './actions';
import { BurnState } from './state';

/**
 * Initial data.
 */
const initialState: BurnState = {
  latestBurnForPage: null,
  latestBurnForPost: null,
  latestBurnForToken: null
};

export const burnReducer = createReducer(initialState, builder => {
  builder
    .addCase(burnForUpDownVoteSuccess, (state, action) => {
      const burnItem = action.payload;
      if (burnItem.burnForType === BurnForType.Page) {
        state.latestBurnForPage = burnItem;
      } else if (burnItem.burnForType === BurnForType.Post) {
        state.latestBurnForPost = burnItem;
      } else if (burnItem.burnForType === BurnForType.Token) {
        state.latestBurnForToken = burnItem;
      }
    })
});
