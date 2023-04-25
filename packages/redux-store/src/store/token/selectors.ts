import { Token } from '@bcpros/lixi-models';
import { createSelector } from 'reselect';

import { RootState } from '../store';

import { tokenAdapter } from './reducer';
import { TokenState } from './state';

const selectAccounts = (state: RootState) => state.accounts;
const selectSelectedAccount = createSelector(selectAccounts, state => state.selectedId);

const { selectAll, selectEntities, selectIds, selectTotal } = tokenAdapter.getSelectors();

export const selectTokens = createSelector((state: RootState) => state.tokens, selectAll);

export const getAllTokensEntities = createSelector((state: RootState) => state.tokens, selectEntities);

export const getSelectedToken = createSelector(
  (state: RootState) => state.tokens,
  (state: TokenState) => state.selectedTokenId as Token
);

export const getTokenById = (id: string) => createSelector(getAllTokensEntities, tokens => tokens?.[id]);
