import { createSelector } from 'reselect';
import { RootState } from '../store';
import { accountsAdapter } from './reducer';
import { AccountsState } from './state';

const { selectAll, selectEntities, selectIds, selectTotal } = accountsAdapter.getSelectors();

export const getAllAccounts = createSelector((state: RootState) => state.accounts, selectAll);

export const getAllAccountsEntities = createSelector((state: RootState) => state.accounts, selectEntities);

export const getSelectedAccountId = createSelector(
  (state: RootState) => state.accounts,
  (accounts: AccountsState) => accounts.selectedId
);

export const getSelectedAccount = createSelector(
  (state: RootState) => state.accounts,
  (accounts: AccountsState) => (accounts.selectedId ? accounts.entities[accounts.selectedId] : undefined)
);

export const getAccountById = (id: number) => createSelector(getAllAccountsEntities, accounts => accounts?.[id]);

export const getEnvelopeUpload = createSelector(
  (state: RootState) => state.accounts,
  (accounts: AccountsState) => accounts.envelopeUpload
);

export const getPageCoverUpload = createSelector(
  (state: RootState) => state.accounts,
  (accounts: AccountsState) => accounts.pageCoverUpload
);

export const getPageAvatarUpload = createSelector(
  (state: RootState) => state.accounts,
  (accounts: AccountsState) => accounts.pageAvatarUpload
);
