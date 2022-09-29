import { createSelector } from 'reselect';
import { RootState } from '../store';
import { localAccountsAdapter } from './reducer';
import { LocalUserAccountsState } from './state';

const { selectAll, selectEntities, selectIds, selectTotal } = localAccountsAdapter.getSelectors();

export const getAllLocalUserAccounts = createSelector((state: RootState) => state.accounts, selectAll);

export const getAllLocalUserAccountsEntities = createSelector((state: RootState) => state.accounts, selectEntities);

export const getSelectedLocalUserAccountId = createSelector(
  (state: RootState) => state.localAccounts,
  (accounts: LocalUserAccountsState) => accounts.selectedId
);

export const getSelectedAccount = createSelector(
  (state: RootState) => state.localAccounts,
  (accounts: LocalUserAccountsState) => (accounts.selectedId ? accounts.entities[accounts.selectedId] : undefined)
);

export const getAccountById = (id: string) =>
  createSelector(getAllLocalUserAccountsEntities, accounts => accounts?.[id]);
