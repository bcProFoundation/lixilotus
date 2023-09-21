import { createEntityAdapter, createReducer, Update } from '@reduxjs/toolkit';
import { removePageMessageSession, upsertPageMessageSession, removeAllPageMessageSession } from './actions';
import { IPageMessageSessionState, PageMessageSessionState } from './state';

export const pageMessageSessionAdapter = createEntityAdapter<IPageMessageSessionState>({
  selectId: pageMessageSession => pageMessageSession.pageMessageSessionId
});

const initialState: PageMessageSessionState = pageMessageSessionAdapter.getInitialState({
  selectedId: ''
});

export const messageReducer = createReducer(initialState, builder => {
  builder
    .addCase(removePageMessageSession, (state, action) => {
      const pageMessageSessionId = action.payload;
      pageMessageSessionAdapter.removeOne(state, pageMessageSessionId);
    })
    .addCase(upsertPageMessageSession, (state, action) => {
      const pageMessageSession: IPageMessageSessionState = action.payload;
      pageMessageSessionAdapter.upsertOne(state, pageMessageSession);
    })
    .addCase(removeAllPageMessageSession, (state, action) => {
      pageMessageSessionAdapter.removeAll(state);
    });
});
