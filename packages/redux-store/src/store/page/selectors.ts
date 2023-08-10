import { Page } from '@bcpros/lixi-models';
import { createSelector } from 'reselect';

import { RootState } from '../store';

import { pageAdapter } from './reducer';
import { PageState } from './state';

const selectAccounts = (state: RootState) => state.accounts;
const selectSelectedAccount = createSelector(selectAccounts, state => state.selectedId);

const { selectAll, selectEntities, selectIds, selectTotal } = pageAdapter.getSelectors();

export const getAllPages = createSelector((state: RootState) => state.pages, selectAll);

export const getAllPagesEntities = createSelector((state: RootState) => state.pages, selectEntities);

export const getSelectedPageId = createSelector(
  (state: RootState) => state.pages,
  (state: PageState) => state.selectedId as string
);

export const pagesByAccountId = createSelector(
  (state: RootState) => state.pages,
  (state: PageState) => state.pagesByAccountId
);

export const getPageById = (id: string) => createSelector(getAllPagesEntities, pages => pages?.[id]);

export const getPageBySelectedAccount = createSelector([selectSelectedAccount, getAllPages], (accountId, pages) =>
  pages.find(page => page.pageAccountId === accountId)
);

export const getCurrentPageMessageSession = createSelector(
  (state: RootState) => state.pages,
  (state: PageState) => state.currentPageMessageSession
);
