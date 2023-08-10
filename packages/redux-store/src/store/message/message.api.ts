import { EntityState } from '@reduxjs/toolkit';
import { PageInfo } from '@generated/types.generated';
import { api, MessageQuery } from './message.generated';

export interface MessageApiState extends EntityState<MessageQuery['message']> {
  pageInfo: PageInfo;
  totalCount: number;
}

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['Message'],
  endpoints: {
    Message: {
      providesTags: (result, error, arg) => ['Message']
    },
    MessageByPageMessageSessionId: {
      providesTags: (result, error, arg) => ['Message'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { id, ...otherArgs } = queryArgs;
          return { id };
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.allMessageByPageMessageSessionId.edges.push(
          ...responseData.allMessageByPageMessageSessionId.edges
        );
        currentCacheData.allMessageByPageMessageSessionId.pageInfo =
          responseData.allMessageByPageMessageSessionId.pageInfo;
        currentCacheData.allMessageByPageMessageSessionId.totalCount =
          responseData.allMessageByPageMessageSessionId.totalCount;
      }
    },
    CreateMessage: {}
  }
});

export { enhancedApi as api };

export const {
  useCreateMessageMutation,
  useLazyMessageByPageMessageSessionIdQuery,
  useLazyMessageQuery,
  useMessageByPageMessageSessionIdQuery,
  useMessageQuery
} = enhancedApi;
