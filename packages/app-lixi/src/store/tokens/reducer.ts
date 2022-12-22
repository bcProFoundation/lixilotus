import { createEntityAdapter, createReducer, Update } from '@reduxjs/toolkit';
import { TokenState } from './state';
import { burnForToken, burnForTokenFailure, burnForTokenSuccess, fetchAllTokensSuccess, getTokenSuccess, postTokenSuccess, selectToken } from './action';
import { Token } from '@bcpros/lixi-models';

export const tokenAdapter = createEntityAdapter<Token>();

const initialState: TokenState = tokenAdapter.getInitialState({
  selectedTokenId: {},
  getTokenById: {}
});

export const tokenReducer = createReducer(initialState, builder => {
  builder
    .addCase(postTokenSuccess, (state, action) => {
      const token: any = action.payload;
      tokenAdapter.upsertOne(state, token as Token);
    })
    .addCase(getTokenSuccess, (state, action) => {
      const tokenInfo = action.payload;
      state.getTokenById = tokenInfo;
    })
    .addCase(fetchAllTokensSuccess, (state, action) => {
      tokenAdapter.setAll(state, action.payload);
    })
    .addCase(selectToken, (state, action) => {
      const tokenInfo = action.payload;
      state.selectedTokenId = tokenInfo;
    })
    .addCase(burnForToken, (state, action) => {
      const { id, burnUp, burnDown } = action.payload;
      const token = state.entities[id];
      if (token) {
        const newLotusBurnUp = token.lotusBurnUp + burnUp;
        const newLotusBurnDown = token.lotusBurnDown + burnDown;
        const changes: Update<Token> = {
          id: id,
          changes: {
            lotusBurnUp: newLotusBurnUp,
            lotusBurnDown: newLotusBurnDown,
            lotusBurnScore: newLotusBurnUp - newLotusBurnDown
          }
        };
        tokenAdapter.updateOne(state, changes);
      }
    })
    .addCase(burnForTokenSuccess, (state, action) => {
      const { id, burnUp, burnDown } = action.payload;
      const token = state.entities[id];
      if (token) {
        const newLotusBurnUp = token.lotusBurnUp;
        const newLotusBurnDown = token.lotusBurnDown;
        const changes: Update<Token> = {
          id: id,
          changes: {
            lotusBurnUp: newLotusBurnUp,
            lotusBurnDown: newLotusBurnDown,
            lotusBurnScore: newLotusBurnUp - newLotusBurnDown
          }
        };
        tokenAdapter.updateOne(state, changes);
      }
    })
    .addCase(burnForTokenFailure, (state, action) => {
      const { id, burnUp, burnDown } = action.payload;
      const token = state.entities[id];
      if (token) {
        const newLotusBurnUp = token.lotusBurnUp - burnUp;
        const newLotusBurnDown = token.lotusBurnDown - burnDown;
        const changes: Update<Token> = {
          id: id,
          changes: {
            lotusBurnUp: newLotusBurnUp,
            lotusBurnDown: newLotusBurnDown,
            lotusBurnScore: newLotusBurnUp - newLotusBurnDown
          }
        };
        tokenAdapter.updateOne(state, changes);
      }
    });
});
