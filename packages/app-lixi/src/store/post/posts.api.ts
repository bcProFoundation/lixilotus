import { api } from './posts.generated';

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['Post', 'Posts'],
  endpoints: {
    Posts: {
      providesTags: (allPosts, error, arg) => ['Posts']
    },
    Post: {
      providesTags: (result, error, arg) => ['Post']
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
