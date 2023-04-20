import { createSelector } from 'reselect';

import { RootState } from '../store';

import { postAdapter } from './reducer';
import { PostState } from './state';

const selectAccounts = (state: RootState) => state.accounts;
const selectSelectedAccount = createSelector(selectAccounts, state => state.selectedId);

const { selectAll, selectEntities, selectIds, selectTotal } = postAdapter.getSelectors();

export const getAllPosts = createSelector((state: RootState) => state.posts, selectAll);

export const getAllPostsEntities = createSelector((state: RootState) => state.posts, selectEntities);

export const getSelectedPostId = createSelector(
  (state: RootState) => state.posts,
  (state: PostState) => state.selectedId as string
);

export const postsByAccountId = createSelector(
  (state: RootState) => state.posts,
  (state: PostState) => state.postsByAccountId
);

export const getPostById = (id: string) => createSelector(getAllPostsEntities, posts => posts?.[id]);
