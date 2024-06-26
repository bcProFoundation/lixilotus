import { Token } from '@bcpros/lixi-models';
import { BurnType } from '@bcpros/lixi-models/lib/burn';
import { createEntityAdapter, createReducer, Update } from '@reduxjs/toolkit';

import {
  burnForToken,
  burnForTokenFailure,
  fetchAllTokensSuccess,
  getTokenSuccess,
  postTokenSuccess,
  selectToken
} from './action';
import { TokenState } from './state';

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
        burnType === BurnType.Up ? (bunrUpValue = burnValue) : (bunrDownValue = burnValue);
        const newDanaBurnUp = token.danaBurnUp + bunrUpValue;
        const newDanaBurnDown = token.danaBurnDown + bunrDownValue;
        const changes: Update<Token> = {
          id: id,
          changes: {
            danaBurnUp: newDanaBurnUp,
            danaBurnDown: newDanaBurnDown,
            danaBurnScore: newDanaBurnUp - newDanaBurnDown
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
        burnType === BurnType.Up ? (bunrUpValue = burnValue) : (bunrDownValue = burnValue);
        const newDanaBurnUp = token.danaBurnUp - bunrUpValue;
        const newDanaBurnDown = token.danaBurnDown - bunrDownValue;
        const changes: Update<Token> = {
          id: id,
          changes: {
            danaBurnUp: newDanaBurnUp,
            danaBurnDown: newDanaBurnDown,
            danaBurnScore: newDanaBurnUp - newDanaBurnDown
          }
        };
        tokenAdapter.updateOne(state, changes);
      }
    });
});
