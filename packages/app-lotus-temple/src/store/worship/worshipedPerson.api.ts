import { EntityState } from '@reduxjs/toolkit';
import { PageInfo } from 'src/generated/types.generated';
import { api, WorshipedPersonQuery } from './worshipedPerson.generated';

export interface WorshipedPersonApiState extends EntityState<WorshipedPersonQuery['worshipedPerson']> {
  pageInfo: PageInfo;
  totalCount: number;
}

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['WorshipedPerson', 'Worship'],
  endpoints: {
    WorshipedPeople: {
      providesTags: (result, error, arg) => ['WorshipedPerson'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { orderBy, ...otherArgs } = queryArgs;
          return orderBy;
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.allWorshipedPerson.edges.push(...responseData.allWorshipedPerson.edges);
        currentCacheData.allWorshipedPerson.pageInfo = responseData.allWorshipedPerson.pageInfo;
        currentCacheData.allWorshipedPerson.totalCount = responseData.allWorshipedPerson.totalCount;
      }
    },
    WorshipedPerson: {
      providesTags: (result, error, arg) => ['WorshipedPerson']
    },
    allWorshipedByPersonId: {
      providesTags: (result, error, arg) => ['WorshipedPerson'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { orderBy, id, ...otherArgs } = queryArgs;
          return { orderBy, id };
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.allWorshipedByPersonId.edges.push(...responseData.allWorshipedByPersonId.edges);
        currentCacheData.allWorshipedByPersonId.pageInfo = responseData.allWorshipedByPersonId.pageInfo;
        currentCacheData.allWorshipedByPersonId.totalCount = responseData.allWorshipedByPersonId.totalCount;
      }
    },
    allWorship: {
      providesTags: (result, error, arg) => ['Worship'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { orderBy, ...otherArgs } = queryArgs;
          return { orderBy };
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.allWorship.edges.push(...responseData.allWorship.edges);
        currentCacheData.allWorship.pageInfo = responseData.allWorship.pageInfo;
        currentCacheData.allWorship.totalCount = responseData.allWorship.totalCount;
      }
    },
    WorshipedPersonBySearch: {
      providesTags: (result, error, arg) => ['WorshipedPerson'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { query, ...otherArgs } = queryArgs;
          return { query };
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.allWorshipedPersonBySearch.edges.push(...responseData.allWorshipedPersonBySearch.edges);
        currentCacheData.allWorshipedPersonBySearch.pageInfo = responseData.allWorshipedPersonBySearch.pageInfo;
      }
    },

    createWorship: {},
    createWorshipedPerson: {}
  }
});

export { enhancedApi as api };

export const {
  useWorshipedPeopleQuery,
  useCreateWorshipMutation,
  useCreateWorshipedPersonMutation,
  useLazyWorshipedPeopleQuery,
  useLazyWorshipedPersonQuery,
  useWorshipedPersonQuery
} = enhancedApi;
