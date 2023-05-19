import { EntityState } from '@reduxjs/toolkit';
import { PageInfo } from '@generated/types.generated';
import { api, TempleQuery } from './temple.generated';

export interface TempleApiState extends EntityState<TempleQuery['temple']> {
  pageInfo: PageInfo;
  totalCount: number;
}

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['Temple'],
  endpoints: {
    Temples: {
      providesTags: (result, error, arg) => ['Temple'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { orderBy, ...otherArgs } = queryArgs;
          return orderBy;
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.allTemple.edges.push(...responseData.allTemple.edges);
        currentCacheData.allTemple.pageInfo = responseData.allTemple.pageInfo;
        currentCacheData.allTemple.totalCount = responseData.allTemple.totalCount;
      }
    },
    Temple: {
      providesTags: (result, error, arg) => ['Temple']
    },
    TempleBySearch: {
      providesTags: (result, error, arg) => ['Temple'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { query, ...otherArgs } = queryArgs;
          return { query };
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.allTempleBySearch.edges.push(...responseData.allTempleBySearch.edges);
        currentCacheData.allTempleBySearch.pageInfo = responseData.allTempleBySearch.pageInfo;
      }
    },
    CreateTemple: {}
  }
});

export { enhancedApi as api };

export const {
  useLazyTempleBySearchQuery,
  useLazyTempleQuery,
  useLazyTemplesQuery,
  useTempleBySearchQuery,
  useTempleQuery,
  useTemplesQuery,
  useCreateTempleMutation
} = enhancedApi;
