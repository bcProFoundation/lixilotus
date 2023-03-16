import { EntityState } from '@reduxjs/toolkit';
import { PageInfo } from 'src/generated/types.generated';
import { api, PostQuery } from './posts.generated';

export interface PostApiState extends EntityState<PostQuery['post']> {
  pageInfo: PageInfo;
  totalCount: number;
}

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['Post'],
  endpoints: {
    Posts: {
      providesTags: (result, error, arg) => ['Post'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { orderBy, minBurnFilter, ...otherArgs } = queryArgs;
          return { orderBy, minBurnFilter };
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.allPosts.edges.push(...responseData.allPosts.edges);
        currentCacheData.allPosts.pageInfo = responseData.allPosts.pageInfo;
        currentCacheData.allPosts.totalCount = responseData.allPosts.totalCount;
      }
    },
    OrphanPosts: {
      providesTags: (result, error, arg) => ['Post'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { orderBy, minBurnFilter, ...otherArgs } = queryArgs;
          return { orderBy, minBurnFilter };
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.allOrphanPosts.edges.push(...responseData.allOrphanPosts.edges);
        currentCacheData.allOrphanPosts.pageInfo = responseData.allOrphanPosts.pageInfo;
        currentCacheData.allOrphanPosts.totalCount = responseData.allOrphanPosts.totalCount;
      }
    },
    PostsBySearch: {
      providesTags: (result, error, arg) => ['Post'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { query, ...otherArgs } = queryArgs;
          return query;
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.allPostsBySearch.edges.push(...responseData.allPostsBySearch.edges);
        currentCacheData.allPostsBySearch.pageInfo = responseData.allPostsBySearch.pageInfo;
      }
    },
    PostsByPageId: {
      providesTags: (result, error, arg) => ['Post'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { orderBy, id, minBurnFilter, ...otherArgs } = queryArgs;
          return { orderBy, id, minBurnFilter };
        }
        return { queryArgs };
      },

      merge(currentCacheData, responseData) {
        currentCacheData.allPostsByPageId.edges.push(...responseData.allPostsByPageId.edges);
        currentCacheData.allPostsByPageId.pageInfo = responseData.allPostsByPageId.pageInfo;
        currentCacheData.allPostsByPageId.totalCount = responseData.allPostsByPageId.totalCount;
      }
    },
    PostsByTokenId: {
      providesTags: (result, error, arg) => ['Post'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { orderBy, id, minBurnFilter, ...otherArgs } = queryArgs;
          return { orderBy, id, minBurnFilter };
        }
        return { queryArgs };
      },

      merge(currentCacheData, responseData) {
        currentCacheData.allPostsByTokenId.edges.push(...responseData.allPostsByTokenId.edges);
        currentCacheData.allPostsByTokenId.pageInfo = responseData.allPostsByTokenId.pageInfo;
        currentCacheData.allPostsByTokenId.totalCount = responseData.allPostsByTokenId.totalCount;
      }
    },
    Post: {
      providesTags: (result, error, arg) => ['Post']
    },
    createPost: {},
    updatePost: {}
  }
});

export { enhancedApi as api };

export const {
  usePostQuery,
  useLazyPostQuery,
  useOrphanPostsQuery,
  useLazyOrphanPostsQuery,
  usePostsQuery,
  useLazyPostsQuery,
  usePostsByPageIdQuery,
  useLazyPostsByPageIdQuery,
  usePostsByTokenIdQuery,
  useLazyPostsByTokenIdQuery,
  usePostsByUserIdQuery,
  useLazyPostsByUserIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation
} = enhancedApi;
