import { EntityState } from '@reduxjs/toolkit';
import { showToast } from '@store/toast/actions';
import intl from 'react-intl-universal';
import { OrderDirection, PageInfo, PostOrderField } from 'src/generated/types.generated';
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
    PostsByPageId: {
      providesTags: (result, error, arg) => ['Post'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { orderBy, id, ...otherArgs } = queryArgs;
          return { orderBy, id };
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
          const { orderBy, id, ...otherArgs } = queryArgs;
          return { orderBy, id };
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
    createPost: {}
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
  usePostsByTokenIdQuery,
  useLazyPostsByTokenIdQuery,
  usePostsByUserIdQuery,
  useLazyPostsByUserIdQuery,
  useCreatePostMutation
} = enhancedApi;
