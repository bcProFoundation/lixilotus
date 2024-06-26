import { createEntityAdapter, createReducer, Update } from '@reduxjs/toolkit';

import {
  editPostSuccess,
  fetchAllPostsSuccess,
  getPost,
  getPostSuccess,
  postPostSuccess,
  setNewPostAvailable,
  setPost,
  setPostsByAccountId,
  setSelectedPost,
  setShowCreatePost
} from './actions';
import { PostQuery } from './posts.generated';
import { PostState } from './state';

export const postAdapter = createEntityAdapter<PostQuery['post']>({
  selectId: post => post.id,
  sortComparer: (a, b) => b.createdAt - a.createdAt
});

const initialState: PostState = postAdapter.getInitialState({
  isNewPost: false,
  selectedId: '',
  postsByAccountId: [],
  showCreatePost: true
});

export const postReducer = createReducer(initialState, builder => {
  builder
    .addCase(postPostSuccess, (state, action) => {
      const post: any = action.payload;
      postAdapter.upsertOne(state, post as PostQuery['post']);
    })
    .addCase(getPostSuccess, (state, action) => {
      const post = action.payload;
      state.selectedId = post.id;
      const updatePost: Update<PostQuery['post']> = {
        id: post.id,
        changes: {
          ...post
        }
      };
      postAdapter.updateOne(state, updatePost);
    })
    .addCase(setPost, (state, action) => {
      const post: any = action.payload;
      state.selectedId = post.id ?? {};
    })
    .addCase(setSelectedPost, (state, action) => {
      state.selectedId = action.payload;
    })
    .addCase(setPostsByAccountId, (state, action) => {
      state.postsByAccountId = action.payload;
    })
    .addCase(fetchAllPostsSuccess, (state, action) => {
      postAdapter.setAll(state, action.payload);
    })
    .addCase(editPostSuccess, (state, action) => {
      const post = action.payload;
      const updatePost: Update<PostQuery['post']> = {
        id: post.id,
        changes: {
          ...post
        }
      };
      postAdapter.updateOne(state, updatePost);
    })
    .addCase(setNewPostAvailable, (state, action) => {
      state.isNewPost = action.payload;
    })
    .addCase(setShowCreatePost, (state, action) => {
      state.showCreatePost = action.payload;
    });
});
