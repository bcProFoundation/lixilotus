import { BurnForType } from '@bcpros/lixi-models/lib/burn';
import { createReducer } from '@reduxjs/toolkit';
import { addBurnQueue, burnForUpDownVoteSuccess, removeAllBurnQueue, removeBurnQueue } from './actions';
import { BurnState } from './state';

/**
 * Initial data.
 */
const initialState: BurnState = {
  burnQueue: [],
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
    .addCase(addBurnQueue, (state, action) => {
      state.burnQueue.push(action.payload);
    })
    .addCase(removeBurnQueue, (state, action) => {
      state.burnQueue.shift();
    })
    .addCase(removeAllBurnQueue, (state, action) => {
      state.burnQueue.length = 0;
    });
});
