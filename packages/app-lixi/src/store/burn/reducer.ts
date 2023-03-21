import { BurnForType } from '@bcpros/lixi-models/lib/burn';
import { createReducer } from '@reduxjs/toolkit';
import {
  addBurnQueue,
  addFailQueue,
  burnForUpDownVoteSuccess,
  moveAllBurnToFailQueue,
  clearBurnQueue,
  clearFailQueue,
  removeBurnQueue,
  removeFailQueue
} from './actions';
import { BurnState } from './state';

/**
 * Initial data.
 */
const initialState: BurnState = {
  burnQueue: [],
  failQueue: [],
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
    .addCase(clearBurnQueue, (state, action) => {
      state.burnQueue.length = 0;
    })
    .addCase(addFailQueue, (state, action) => {
      state.failQueue.push(action.payload);
    })
    .addCase(removeFailQueue, (state, action) => {
      state.failQueue.shift();
    })
    .addCase(clearFailQueue, (state, action) => {
      state.failQueue.length = 0;
    })
    .addCase(moveAllBurnToFailQueue, (state, action) => {
      state.failQueue = [...state.burnQueue];
    });
});
