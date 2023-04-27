import { createSelector } from 'reselect';

import { RootState } from '../store';

import { localAccountsAdapter } from './reducer';
import { LocalUserAccountsState } from './state';

const { selectAll, selectEntities, selectIds, selectTotal } = localAccountsAdapter.getSelectors();

export const getAllLocalUserAccounts = createSelector((state: RootState) => state.localAccounts, selectAll);

export const getAllLocalUserAccountsEntities = createSelector(
  (state: RootState) => state.localAccounts,
  selectEntities
);

export const getSelectedLocalUserAccountId = createSelector(
  (state: RootState) => state.localAccounts,
  (accounts: LocalUserAccountsState) => accounts.selectedId
);

export const getSelectedLocalUserAccount = createSelector(
  (state: RootState) => state.localAccounts,
  (accounts: LocalUserAccountsState) => (accounts.selectedId ? accounts.entities[accounts.selectedId] : undefined)
);

export const getLocalUserAccountById = (id: string) =>
  createSelector(getAllLocalUserAccountsEntities, accounts => accounts?.[id]);
