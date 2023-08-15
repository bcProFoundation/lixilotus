import { EntityState } from '@reduxjs/toolkit';
import { PageInfo } from '@generated/types.generated';
import { api, PageMessageSessionQuery } from './pageMessageSession.generated';

export interface PageMessageSessionApiState extends EntityState<PageMessageSessionQuery['pageMessageSession']> {
  pageInfo: PageInfo;
  totalCount: number;
}

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['PageMessageSession'],
  endpoints: {
    PageMessageSession: {
      providesTags: (result, error, arg) => ['PageMessageSession']
    },
    PendingPageMessageSessionByPageId: {
      providesTags: (result, error, arg) => ['PageMessageSession'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { id, ...otherArgs } = queryArgs;
          return { id };
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.allPendingPageMessageSessionByPageId.edges.push(
          ...responseData.allPendingPageMessageSessionByPageId.edges
        );
        currentCacheData.allPendingPageMessageSessionByPageId.pageInfo =
          responseData.allPendingPageMessageSessionByPageId.pageInfo;
        currentCacheData.allPendingPageMessageSessionByPageId.totalCount =
          responseData.allPendingPageMessageSessionByPageId.totalCount;
      }
    },
    OpenPageMessageSessionByPageId: {
      providesTags: (result, error, arg) => ['PageMessageSession'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { id, ...otherArgs } = queryArgs;
          return { id };
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.allOpenPageMessageSessionByPageId.edges.push(
          ...responseData.allOpenPageMessageSessionByPageId.edges
        );
        currentCacheData.allOpenPageMessageSessionByPageId.pageInfo =
          responseData.allOpenPageMessageSessionByPageId.pageInfo;
        currentCacheData.allOpenPageMessageSessionByPageId.totalCount =
          responseData.allOpenPageMessageSessionByPageId.totalCount;
      }
    },
    PendingPageMessageSessionByAccountId: {
      providesTags: (result, error, arg) => ['PageMessageSession'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { id, ...otherArgs } = queryArgs;
          return { id };
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.allPendingPageMessageSessionByAccountId.edges.push(
          ...responseData.allPendingPageMessageSessionByAccountId.edges
        );
        currentCacheData.allPendingPageMessageSessionByAccountId.pageInfo =
          responseData.allPendingPageMessageSessionByAccountId.pageInfo;
        currentCacheData.allPendingPageMessageSessionByAccountId.totalCount =
          responseData.allPendingPageMessageSessionByAccountId.totalCount;
      }
    },
    OpenPageMessageSessionByAccountId: {
      providesTags: (result, error, arg) => ['PageMessageSession'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { id, ...otherArgs } = queryArgs;
          return { id };
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.allOpenPageMessageSessionByAccountId.edges.push(
          ...responseData.allOpenPageMessageSessionByAccountId.edges
        );
        currentCacheData.allOpenPageMessageSessionByAccountId.pageInfo =
          responseData.allOpenPageMessageSessionByAccountId.pageInfo;
        currentCacheData.allOpenPageMessageSessionByAccountId.totalCount =
          responseData.allOpenPageMessageSessionByAccountId.totalCount;
      }
    },
    PageMessageSessionByAccountId: {
      providesTags: (result, error, arg) => ['PageMessageSession'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { id, ...otherArgs } = queryArgs;
          return { id };
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.allPageMessageSessionByAccountId.edges.push(
          ...responseData.allPageMessageSessionByAccountId.edges
        );
        currentCacheData.allPageMessageSessionByAccountId.pageInfo =
          responseData.allPageMessageSessionByAccountId.pageInfo;
        currentCacheData.allPageMessageSessionByAccountId.totalCount =
          responseData.allPageMessageSessionByAccountId.totalCount;
      }
    },
    UserHadMessageToPage: {
      providesTags: (result, error, arg) => ['PageMessageSession'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { pageId, ...otherArgs } = queryArgs;
          return { pageId };
        }
        return { queryArgs };
      }
    },
    ClosedPageMessageSession: {
      providesTags: (result, error, arg) => ['PageMessageSession'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { accountId, pageId, ...otherArgs } = queryArgs;
          return { accountId, pageId };
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.allClosedPageMessageSession.edges.push(...responseData.allClosedPageMessageSession.edges);
        currentCacheData.allClosedPageMessageSession.pageInfo = responseData.allClosedPageMessageSession.pageInfo;
        currentCacheData.allClosedPageMessageSession.totalCount = responseData.allClosedPageMessageSession.totalCount;
      }
    },

    ClosePageMessageSession: {},
    OpenPageMessageSession: {},
    CreatePageMessageSession: {}
  }
});

export { enhancedApi as api };

export const {
  useCreatePageMessageSessionMutation,
  useLazyPageMessageSessionByAccountIdQuery,
  useLazyOpenPageMessageSessionByPageIdQuery,
  useLazyPageMessageSessionQuery,
  usePageMessageSessionByAccountIdQuery,
  useOpenPageMessageSessionByPageIdQuery,
  useLazyPendingPageMessageSessionByPageIdQuery,
  usePendingPageMessageSessionByPageIdQuery,
  useLazyOpenPageMessageSessionByAccountIdQuery,
  useLazyPendingPageMessageSessionByAccountIdQuery,
  useOpenPageMessageSessionByAccountIdQuery,
  usePendingPageMessageSessionByAccountIdQuery,
  usePageMessageSessionQuery,
  useLazyClosedPageMessageSessionQuery,
  useClosedPageMessageSessionQuery,
  useUserHadMessageToPageQuery,
  useClosePageMessageSessionMutation,
  useOpenPageMessageSessionMutation,
  useLazyUserHadMessageToPageQuery
} = enhancedApi;
