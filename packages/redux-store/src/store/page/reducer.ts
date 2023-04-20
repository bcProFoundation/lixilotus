import { createEntityAdapter, createReducer, Update } from '@reduxjs/toolkit';
import { Page } from 'src/generated/types.generated';

import {
  editPageSuccess,
  fetchAllPagesSuccess,
  getPage,
  getPageSuccess,
  postPageSuccess,
  setPage,
  setPagesByAccountId,
  setSelectedPage
} from './action';
import { PageState } from './state';

export const pageAdapter = createEntityAdapter<Page>({});

const initialState: PageState = pageAdapter.getInitialState({
  selectedId: '',
  pagesByAccountId: []
});

export const pageReducer = createReducer(initialState, builder => {
  builder
    .addCase(postPageSuccess, (state, action) => {
      const page: any = action.payload;
      pageAdapter.upsertOne(state, page as Page);
    })
    .addCase(getPageSuccess, (state, action) => {
      const page = action.payload;
      state.selectedId = page.id;
      const updatePage: Update<Page> = {
        id: page.id,
        changes: {
          ...page
        }
      };
      pageAdapter.updateOne(state, updatePage);
    })
    .addCase(setPage, (state, action) => {
      const page: any = action.payload;
      state.selectedId = page.id ?? {};
    })
    .addCase(setSelectedPage, (state, action) => {
      state.selectedId = action.payload;
    })
    .addCase(setPagesByAccountId, (state, action) => {
      state.pagesByAccountId = action.payload;
    })
    .addCase(fetchAllPagesSuccess, (state, action) => {
      pageAdapter.setAll(state, action.payload);
    })
    .addCase(editPageSuccess, (state, action) => {
      const page = action.payload;
      const updatePage: Update<Page> = {
        id: page.id,
        changes: {
          ...page
        }
      };
      pageAdapter.updateOne(state, updatePage);
    });
});
