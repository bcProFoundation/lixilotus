import { createSelector } from 'reselect';

import { RootState } from '../store';

import { PageMessageSessionState } from './state';

import { pageMessageSessionAdapter } from './reducer';

export const getPageMessageSessionState = createSelector(
  (state: RootState) => state.pageMessage,
  (pageMessageSessionState: PageMessageSessionState) => pageMessageSessionState
);

const { selectAll, selectEntities, selectIds, selectTotal } = pageMessageSessionAdapter.getSelectors();

export const getAllPageMessageSession = createSelector((state: RootState) => state.pageMessageSessionState, selectAll);

export const getAllPageMessageSessionEntities = createSelector((state: RootState) => {
  if (state.pageMessage) {
    return state.pageMessage;
  } else {
    return {};
  }
}, selectEntities);

export const getPageMessageSessionById = (id: string) =>
  createSelector(getAllPageMessageSessionEntities, pageMessageSessions => {
    return pageMessageSessions?.[id];
  });
