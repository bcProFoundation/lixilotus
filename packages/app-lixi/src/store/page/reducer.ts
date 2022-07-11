import { createEntityAdapter, createReducer } from '@reduxjs/toolkit';
import { PageState } from './state';
import { setSelectedPage } from './action';
import { PageDetail } from './pageDetail.model';

export const pageAdapter = createEntityAdapter<PageDetail>({});

const initialState: PageState = pageAdapter.getInitialState({
  selectedId: ''
});

export const pageReducer = createReducer(initialState, builder => {
  builder.addCase(setSelectedPage, (state, action) => {
    state.selectedId = action.payload;
  });
});
