import { CreatePostCommand, EditPostCommand } from '@bcpros/lixi-models';
import { createAction } from '@reduxjs/toolkit';
import { Post } from 'src/generated/types.generated';

export const fetchAllPosts = createAction('posts/fetchAllPosts');
export const fetchAllPostsSuccess = createAction<any>('posts/fetchAllPostsSuccess');
export const fetchAllPostsFailure = createAction<any>('posts/fetchAllPostsFailure');
export const setSelectedPost = createAction<string>('posts/getSelectedId');
export const setPostsByAccountId = createAction<any>('posts/setPostsByAccountId');
export const getPostsByAccountId = createAction<any>('posts/getPostsAccountId');
export const postPost = createAction<CreatePostCommand>('posts/postPost');
export const postPostSuccess = createAction<any>('posts/postPostSuccess');
export const postPostFailure = createAction<string>('posts/postPostFailure');
export const setPost = createAction<Post>('posts/setPost');
export const getPost = createAction<string>('page/getPost');
export const getPostSuccess = createAction<Post>('page/getPostSuccess');
export const getPostFailure = createAction<string>('page/getPostFailure');
export const editPost = createAction<EditPostCommand>('posts/editPost');
export const editPostSuccess = createAction<any>('posts/editPostSuccess');
export const editPostFailure = createAction<string>('posts/editPostFailure');