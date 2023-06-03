import { EntityState } from '@reduxjs/toolkit';
import { PageInfo } from '@generated/types.generated';
import { api, HashtagQuery } from './hashtag.generated';

export interface TempleApiState extends EntityState<HashtagQuery['hashtag']> {
  pageInfo: PageInfo;
  totalCount: number;
}

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['Temple'],
  endpoints: {
    Hashtags: {
      providesTags: (result, error, arg) => ['Temple'],
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
      providesTags: (result, error, arg) => ['Temple']
    },
    HashtagBySearch: {
      providesTags: (result, error, arg) => ['Temple'],
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
    }
  }
});

export { enhancedApi as api };

export const {
  useHashtagBySearchQuery,
  useHashtagQuery,
  useHashtagsQuery,
  useLazyHashtagBySearchQuery,
  useLazyHashtagQuery,
  useLazyHashtagsQuery
} = enhancedApi;
