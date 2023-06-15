import { EntityState } from '@reduxjs/toolkit';
import { PageInfo } from '@generated/types.generated';
import { api, HashtagQuery } from './hashtag.generated';

export interface TempleApiState extends EntityState<HashtagQuery['hashtag']> {
  pageInfo: PageInfo;
  totalCount: number;
}

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['Hashtag'],
  endpoints: {
    Hashtags: {
      providesTags: (result, error, arg) => ['Hashtag'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { orderBy, ...otherArgs } = queryArgs;
          return orderBy;
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.allHashtag.edges.push(...responseData.allHashtag.edges);
        currentCacheData.allHashtag.pageInfo = responseData.allHashtag.pageInfo;
        currentCacheData.allHashtag.totalCount = responseData.allHashtag.totalCount;
      }
    },
    Hashtag: {
      providesTags: (result, error, arg) => ['Hashtag']
    },
    HashtagBySearch: {
      providesTags: (result, error, arg) => ['Hashtag'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { query, ...otherArgs } = queryArgs;
          return { query };
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.allHashtagBySearch.edges.push(...responseData.allHashtagBySearch.edges);
        currentCacheData.allHashtagBySearch.pageInfo = responseData.allHashtagBySearch.pageInfo;
      }
    },
    HashtagsByPage: {
      providesTags: (result, error, arg) => ['Hashtag'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { orderBy, id, ...otherArgs } = queryArgs;
          return { orderBy, id };
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.allHashtagByPage.edges.push(...responseData.allHashtagByPage.edges);
        currentCacheData.allHashtagByPage.pageInfo = responseData.allHashtagByPage.pageInfo;
        currentCacheData.allHashtagByPage.totalCount = responseData.allHashtagByPage.totalCount;
      }
    },
    HashtagsByToken: {
      providesTags: (result, error, arg) => ['Hashtag'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { orderBy, id, ...otherArgs } = queryArgs;
          return { orderBy, id };
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.allHashtagByToken.edges.push(...responseData.allHashtagByToken.edges);
        currentCacheData.allHashtagByToken.pageInfo = responseData.allHashtagByToken.pageInfo;
        currentCacheData.allHashtagByToken.totalCount = responseData.allHashtagByToken.totalCount;
      }
    }
  }
});

export { enhancedApi as api };

export const {
  useHashtagBySearchQuery,
  useHashtagQuery,
  useHashtagsQuery,
  useHashtagsByPageQuery,
  useLazyHashtagsByPageQuery,
  useLazyHashtagBySearchQuery,
  useHashtagsByTokenQuery,
  useLazyHashtagsByTokenQuery,
  useLazyHashtagQuery,
  useLazyHashtagsQuery
} = enhancedApi;
