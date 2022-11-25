import { createEntityAdapter, createReducer } from '@reduxjs/toolkit';
import { TokenState } from './state';
import { fetchAllTokensSuccess, getTokenSuccess, postTokenSuccess, setSelectedTokenId } from './action';
import { Token } from '@bcpros/lixi-models';

export const tokenAdapter = createEntityAdapter<Token>({});

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
    .addCase(setSelectedTokenId, (state, action) => {
      const tokenInfo = action.payload;
      state.selectedTokenId = tokenInfo;
    });
});
