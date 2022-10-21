import { createEntityAdapter, createReducer, Update } from '@reduxjs/toolkit';
import { PostState } from './state';
import {
  fetchAllPostsSuccess,
  setPostsByAccountId,
  setSelectedPost,
  editPostSuccess,
  postPostSuccess,
  setPost,
  getPost,
  getPostSuccess
} from './action';
import { Post } from 'src/generated/types.generated';

export const postAdapter = createEntityAdapter<Post>({});

const initialState: PostState = postAdapter.getInitialState({
  selectedId: '',
  postsByAccountId: []
});

export const postReducer = createReducer(initialState, builder => {
  builder
    .addCase(postPostSuccess, (state, action) => {
      const post: any = action.payload;
      postAdapter.upsertOne(state, post as Post);
    })
    .addCase(getPostSuccess, (state, action) => {
      const post = action.payload;
      state.selectedId = post.id;
      const updatePost: Update<Post> = {
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
      const updatePost: Update<Post> = {
        id: post.id,
        changes: {
          ...post
        }
      };
      postAdapter.updateOne(state, updatePost);
    });
});
