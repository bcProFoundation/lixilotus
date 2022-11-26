import { createSelector } from 'reselect';
import { RootState } from '../store';
import { tokenAdapter } from './reducer';
import { TokenState } from './state';

const selectAccounts = (state: RootState) => state.accounts;
const selectSelectedAccount = createSelector(selectAccounts, state => state.selectedId);

const { selectAll, selectEntities, selectIds, selectTotal } = tokenAdapter.getSelectors();

export const selectTokens = createSelector((state: RootState) => state.tokens, selectAll);

export const getSelectedToken = createSelector(
  (state: RootState) => state.tokens,
  (state: TokenState) => state.selectedTokenId as object
);
