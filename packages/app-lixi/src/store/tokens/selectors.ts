// import { Page } from '@bcpros/lixi-models';
import { createSelector } from 'reselect';
import { RootState } from '../store';
import { tokenAdapter } from './reducer';
import { TokenState } from './state';
// import { PageState, TokenState } from './state';

const selectAccounts = (state: RootState) => state.accounts;
const selectSelectedAccount = createSelector(selectAccounts, state => state.selectedId);

const { selectAll, selectEntities, selectIds, selectTotal } = tokenAdapter.getSelectors();

export const getAllTokens = createSelector((state: RootState) => state.tokens, selectAll);

// export const getAllPagesEntities = createSelector((state: RootState) => state.pages, selectEntities);

export const getSelectedTokenId = createSelector(
  (state: RootState) => state.tokens,
  (state: TokenState) => state.selectedTokenId as object
);

// export const pagesByAccountId = createSelector(
//   (state: RootState) => state.tokens,
//   (state: TokenState) => state.pagesByAccountId
// );

// export const getPageById = (id: string) => createSelector(getAllPagesEntities, pages => pages?.[id]);

// export const getPageBySelectedAccount = createSelector([selectSelectedAccount, getAllPages], (accountId, pages) =>
//   pages.find(page => page.pageAccountId === accountId)
// );
