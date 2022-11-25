import { createEntityAdapter, createReducer, Update } from '@reduxjs/toolkit';
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
      // state.getTokenById = token;
      // const updateToken: Update<Token> = {
      //   id: token.id,
      //   changes: {
      //     ...token
      //   }
      // };
      // tokenAdapter.updateOne(state, updateToken);
      state.getTokenById = tokenInfo;
    })
    .addCase(fetchAllTokensSuccess, (state, action) => {
      tokenAdapter.setAll(state, action.payload);
    })
    .addCase(setSelectedTokenId, (state, action) => {
      const tokenInfo = action.payload;
      state.selectedTokenId = tokenInfo;
    });
  // .addCase(setPage, (state, action) => {
  //   const page: any = action.payload;
  //   state.selectedId = page.id ?? {};
  // })
  // .addCase(setSelectedPage, (state, action) => {
  //   state.selectedId = action.payload;
  // })
  // .addCase(setPagesByAccountId, (state, action) => {
  //   state.pagesByAccountId = action.payload;
  // })
});
