import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { PageInfo } from 'src/generated/types.generated';
import { api, PostsQuery, PostQuery } from './posts.generated';

export interface PostApiState extends EntityState<PostQuery['post']> {
  pageInfo: PageInfo;
  totalCount: number;
}

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['Post'],
  endpoints: {
    Posts: {
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { orderBy, ...otherArgs } = queryArgs;
          return orderBy;
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.allPosts.edges.push(...responseData.allPosts.edges);
        currentCacheData.allPosts.pageInfo = responseData.allPosts.pageInfo;
        currentCacheData.allPosts.totalCount = responseData.allPosts.totalCount;
      }
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
