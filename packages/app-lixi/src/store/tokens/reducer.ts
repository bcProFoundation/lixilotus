import { createEntityAdapter, createReducer, Update } from '@reduxjs/toolkit';
import { TokenState } from './state';
import { burnForToken, burnForTokenFailure, fetchAllTokensSuccess, getTokenSuccess, postTokenSuccess, selectToken } from './action';
import { Token } from '@bcpros/lixi-models';
import { BurnType } from '@bcpros/lixi-models/lib/burn';

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
      const { id, burnType, burnValue } = action.payload;
      const token = state.entities[id];
      if (token) {
        let bunrUpValue = 0;
        let bunrDownValue = 0;
        burnType === BurnType.Up ? bunrUpValue = burnValue: bunrDownValue = burnValue;
        const newLotusBurnUp = token.lotusBurnUp + bunrUpValue;
        const newLotusBurnDown = token.lotusBurnDown + bunrDownValue;
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
      const { id, burnType, burnValue } = action.payload;
      const token = state.entities[id];
      if (token) {
        let bunrUpValue = 0;
        let bunrDownValue = 0;
        burnType === BurnType.Up ? bunrUpValue = burnValue: bunrDownValue = burnValue;
        const newLotusBurnUp = token.lotusBurnUp - bunrUpValue;
        const newLotusBurnDown = token.lotusBurnDown - bunrDownValue;
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
