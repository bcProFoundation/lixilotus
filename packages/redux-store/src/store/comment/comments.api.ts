import { EntityState } from '@reduxjs/toolkit';
import { PageInfo } from '@generated/types.generated';

import { api, CommentQuery } from './comments.generated';

export interface CommentApiState extends EntityState<CommentQuery['comment']> {
  pageInfo: PageInfo;
  totalCount: number;
}

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['Comment'],
  endpoints: {
    CommentsToPostId: {
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { orderBy, id, ...otherArgs } = queryArgs;
          return { orderBy, id };
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.allCommentsToPostId.edges.push(...responseData.allCommentsToPostId.edges);
        currentCacheData.allCommentsToPostId.pageInfo = responseData.allCommentsToPostId.pageInfo;
        currentCacheData.allCommentsToPostId.totalCount = responseData.allCommentsToPostId.totalCount;
      }
    },
    createComment: {}
  }
});

export { enhancedApi as api };

export const { useCommentQuery, useCommentsToPostIdQuery, useLazyCommentsToPostIdQuery, useCreateCommentMutation } =
  enhancedApi;
