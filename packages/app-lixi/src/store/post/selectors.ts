import { Page } from '@bcpros/lixi-models';
import { createSelector } from 'reselect';
import { RootState } from '../store';
import { postAdapter } from './reducer';
import { PostState } from './state';

const selectAccounts = (state: RootState) => state.accounts;
const selectSelectedAccount = createSelector(selectAccounts, state => state.selectedId);

const { selectAll, selectEntities, selectIds, selectTotal } = postAdapter.getSelectors();

export const getAllPages = createSelector((state: RootState) => state.posts, selectAll);

export const getAllPagesEntities = createSelector((state: RootState) => state.posts, selectEntities);

export const getSelectedPageId = createSelector(
  (state: RootState) => state.posts,
  (state: PostState) => state.selectedId as string
);

export const postsByAccountId = createSelector(
  (state: RootState) => state.posts,
  (state: PostState) => state.postsByAccountId
);

export const getPageById = (id: string) => createSelector(getAllPagesEntities, posts => posts?.[id]);

export const getPageBySelectedAccount = createSelector([selectSelectedAccount, getAllPages], (accountId, posts) =>
  posts.find(post => post.postAccountId === accountId)
);
