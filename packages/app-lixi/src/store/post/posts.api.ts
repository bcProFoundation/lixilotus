import { api } from './posts.generated';

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['Post'],
  endpoints: {
    Posts: {
      providesTags: (allPosts, error, arg) => ['Post']
    },
    Post: {
      providesTags: ['Post']
    },
    createPost: {
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
  useCreatePostMutation
} = enhancedApi;
