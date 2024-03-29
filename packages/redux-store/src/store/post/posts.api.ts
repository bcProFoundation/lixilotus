import { PageInfo } from '@generated/types.generated';
import { EntityState } from '@reduxjs/toolkit';

import { api, PostQuery } from './posts.generated';

export interface PostApiState extends EntityState<PostQuery['post']> {
  pageInfo: PageInfo;
  totalCount: number;
}

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['Post'],
  endpoints: {
    PostsBySearch: {
      providesTags: (result, error, arg) => ['Post'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { query, minBurnFilter, ...otherArgs } = queryArgs;
          return { query, minBurnFilter };
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.allPostsBySearch.edges.push(...responseData.allPostsBySearch.edges);
        currentCacheData.allPostsBySearch.pageInfo = responseData.allPostsBySearch.pageInfo;
      }
    },
    PostsBySearchWithHashtag: {
      providesTags: (result, error, arg) => ['Post'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { hashtags, query, minBurnFilter, ...otherArgs } = queryArgs;
          return { hashtags, query, minBurnFilter };
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.allPostsBySearchWithHashtag.edges.push(...responseData.allPostsBySearchWithHashtag.edges);
        currentCacheData.allPostsBySearchWithHashtag.pageInfo = responseData.allPostsBySearchWithHashtag.pageInfo;
      }
    },
    PostsBySearchWithHashtagAtPage: {
      providesTags: (result, error, arg) => ['Post'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { hashtags, query, minBurnFilter, pageId, ...otherArgs } = queryArgs;
          return { hashtags, query, minBurnFilter, pageId };
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.allPostsBySearchWithHashtagAtPage.edges.push(
          ...responseData.allPostsBySearchWithHashtagAtPage.edges
        );
        currentCacheData.allPostsBySearchWithHashtagAtPage.pageInfo =
          responseData.allPostsBySearchWithHashtagAtPage.pageInfo;
      }
    },
    PostsBySearchWithHashtagAtToken: {
      providesTags: (result, error, arg) => ['Post'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { hashtags, query, minBurnFilter, tokenId, ...otherArgs } = queryArgs;
          return { hashtags, query, minBurnFilter, tokenId };
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.allPostsBySearchWithHashtagAtToken.edges.push(
          ...responseData.allPostsBySearchWithHashtagAtToken.edges
        );
        currentCacheData.allPostsBySearchWithHashtagAtToken.pageInfo =
          responseData.allPostsBySearchWithHashtagAtToken.pageInfo;
      }
    },
    PostsByPageId: {
      providesTags: (result, error, arg) => ['Post'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { id, minBurnFilter, accountId, ...otherArgs } = queryArgs;
          return { id, minBurnFilter, accountId };
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
          const { id, minBurnFilter, ...otherArgs } = queryArgs;
          return { id, minBurnFilter };
        }
        return { queryArgs };
      },

      merge(currentCacheData, responseData) {
        currentCacheData.allPostsByTokenId.edges.push(...responseData.allPostsByTokenId.edges);
        currentCacheData.allPostsByTokenId.pageInfo = responseData.allPostsByTokenId.pageInfo;
        currentCacheData.allPostsByTokenId.totalCount = responseData.allPostsByTokenId.totalCount;
      }
    },
    PostsByUserId: {
      providesTags: (result, error, arg) => ['Post'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { id, minBurnFilter, ...otherArgs } = queryArgs;
          return { id, minBurnFilter };
        }
        return { queryArgs };
      },

      merge(currentCacheData, responseData) {
        currentCacheData.allPostsByUserId.edges.push(...responseData.allPostsByUserId.edges);
        currentCacheData.allPostsByUserId.pageInfo = responseData.allPostsByUserId.pageInfo;
        currentCacheData.allPostsByUserId.totalCount = responseData.allPostsByUserId.totalCount;
      }
    },
    Post: {
      providesTags: (result, error, arg) => ['Post']
    },
    PostsByHashtagId: {
      providesTags: (result, error, arg) => ['Post'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { id, ...otherArgs } = queryArgs;
          return { id };
        }
        return { queryArgs };
      },

      merge(currentCacheData, responseData) {
        currentCacheData.allPostsByHashtagId.edges.push(...responseData.allPostsByHashtagId.edges);
        currentCacheData.allPostsByHashtagId.pageInfo = responseData.allPostsByHashtagId.pageInfo;
        currentCacheData.allPostsByHashtagId.totalCount = responseData.allPostsByHashtagId.totalCount;
      }
    },

    createPost: {
      async onQueryStarted({ input }, { dispatch, queryFulfilled }) {
        const { extraArguments, pageId, tokenPrimaryId } = input;
        const { hashtagId, hashtags, isTop, minBurnFilter, orderBy, query } = extraArguments;

        try {
          const { data: result } = await queryFulfilled;
          /* Dont know why onQueryStarted will be called 4 times when create new post
            So we need to prevent multiple update to cache
            https://github.com/reduxjs/redux-toolkit/issues/2394#issuecomment-1198430740 &&
            https://github.com/reduxjs/redux-toolkit/issues/2394#issuecomment-1198589018
          */

          if (hashtagId) {
            dispatch(
              api.util.updateQueryData('PostsByHashtagId', { id: hashtagId }, draft => {
                draft.allPostsByHashtagId.edges.unshift({
                  cursor: result.createPost.id,
                  node: {
                    ...result.createPost
                  }
                });
                draft.allPostsByHashtagId.totalCount = draft.allPostsByHashtagId.totalCount + 1;
              })
            );
          }

          if (hashtags || query) {
            dispatch(
              api.util.updateQueryData(
                'PostsBySearchWithHashtag',
                { hashtags: hashtags, query: query, minBurnFilter: minBurnFilter },
                draft => {
                  draft.allPostsBySearchWithHashtag.edges.unshift({
                    cursor: result.createPost.id,
                    node: {
                      ...result.createPost
                    }
                  });
                }
              )
            );
          }

          if (pageId) {
            dispatch(
              api.util.updateQueryData(
                'PostsBySearchWithHashtagAtPage',
                { minBurnFilter: minBurnFilter, pageId: pageId, hashtags: hashtags, query: query },
                draft => {
                  draft.allPostsBySearchWithHashtagAtPage.edges.unshift({
                    cursor: result.createPost.id,
                    node: {
                      ...result.createPost
                    }
                  });
                }
              )
            );
            dispatch(
              api.util.updateQueryData('PostsByPageId', { id: pageId, minBurnFilter: minBurnFilter }, draft => {
                draft.allPostsByPageId.edges.unshift({
                  cursor: result.createPost.id,
                  node: {
                    ...result.createPost
                  }
                });
                draft.allPostsByPageId.totalCount = draft.allPostsByPageId.totalCount + 1;
              })
            );
          }

          if (tokenPrimaryId) {
            dispatch(
              api.util.updateQueryData(
                'PostsBySearchWithHashtagAtToken',
                { minBurnFilter: minBurnFilter, tokenId: tokenPrimaryId, hashtags: hashtags, query: query },
                draft => {
                  draft.allPostsBySearchWithHashtagAtToken.edges.unshift({
                    cursor: result.createPost.id,
                    node: {
                      ...result.createPost
                    }
                  });
                }
              )
            );
            dispatch(
              api.util.updateQueryData(
                'PostsByTokenId',
                { id: tokenPrimaryId, minBurnFilter: minBurnFilter },
                draft => {
                  draft.allPostsByTokenId.edges.unshift({
                    cursor: result.createPost.id,
                    node: {
                      ...result.createPost
                    }
                  });
                  draft.allPostsByTokenId.totalCount = draft.allPostsByTokenId.totalCount + 1;
                }
              )
            );
          }
        } catch {}
      }
    },
    updatePost: {
      async onQueryStarted({ input }, { dispatch, queryFulfilled }) {
        const { extraArguments } = input;
        const { isTop, minBurnFilter } = extraArguments;
        try {
          const { data: result } = await queryFulfilled;
        } catch {}
      }
    },
    repost: {}
  }
});

export { enhancedApi as api };

export const {
  usePostQuery,
  useLazyPostQuery,
  usePostsByPageIdQuery,
  useLazyPostsByPageIdQuery,
  usePostsByTokenIdQuery,
  useLazyPostsByTokenIdQuery,
  usePostsByUserIdQuery,
  useLazyPostsByUserIdQuery,
  usePostsBySearchQuery,
  useLazyPostsBySearchQuery,
  usePostsBySearchWithHashtagQuery,
  useLazyPostsBySearchWithHashtagQuery,
  usePostsBySearchWithHashtagAtPageQuery,
  useLazyPostsBySearchWithHashtagAtPageQuery,
  useLazyPostsByHashtagIdQuery,
  usePostsByHashtagIdQuery,
  useLazyPostsBySearchWithHashtagAtTokenQuery,
  usePostsBySearchWithHashtagAtTokenQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useRepostMutation
} = enhancedApi;
