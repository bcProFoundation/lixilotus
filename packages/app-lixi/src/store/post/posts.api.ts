import { api } from './posts.generated';

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['Post'],
  endpoints: {
    Posts: {
      providesTags: ['Post']
    },
    Post: {
      providesTags: ['Post']
    },
    createPost: {
      invalidatesTags: ['Post']
    },
    updatePost: {
      invalidatesTags: ['Post']
    }
  }
});

export { enhancedApi as api };

export const {
  usePostQuery,
  useLazyPostQuery,
  usePostsQuery,
  useLazyPostsQuery,
  usePostsByPageIdQuery,
  useLazyPostsByPageIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
} = enhancedApi;
