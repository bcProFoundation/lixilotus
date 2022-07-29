import { createEntityAdapter, createReducer } from '@reduxjs/toolkit';
import { PageState } from './state';
import { fetchAllPagesSuccess, setPagesByAccountId, setSelectedPage } from './action';
import { Page } from '@bcpros/lixi-models/src';

export const pageAdapter = createEntityAdapter<Page>({});

const initialState: PageState = pageAdapter.getInitialState({
  selectedId: '',
  pagesByAccountId: []
});

export const pageReducer = createReducer(initialState, builder => {
  builder
    .addCase(setSelectedPage, (state, action) => {
      state.selectedId = action.payload;
    })
    .addCase(setPagesByAccountId, (state, action) => {
      state.pagesByAccountId = action.payload;
    })
    .addCase(fetchAllPagesSuccess, (state, action) => {
      pageAdapter.setAll(state, action.payload);
    });
});
