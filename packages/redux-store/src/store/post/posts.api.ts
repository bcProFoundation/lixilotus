import { EntityState } from '@reduxjs/toolkit';
import { PageInfo } from '@generated/types.generated';

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
          const { orderBy, minBurnFilter, isTop, ...otherArgs } = queryArgs;
          return { orderBy, minBurnFilter, isTop };
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
          const { query, minBurnFilter, hashtags, ...otherArgs } = queryArgs;
          return { query, minBurnFilter, hashtags };
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
          const { query, minBurnFilter, hashtags, pageId, ...otherArgs } = queryArgs;
          return { query, minBurnFilter, hashtags, pageId };
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
          const { query, minBurnFilter, hashtags, tokenId, ...otherArgs } = queryArgs;
          return { query, minBurnFilter, hashtags, tokenId };
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
    PostsByUserId: {
      providesTags: (result, error, arg) => ['Post'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { orderBy, id, minBurnFilter, ...otherArgs } = queryArgs;
          return { orderBy, id, minBurnFilter };
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
          const { orderBy, id, minBurnFilter, ...otherArgs } = queryArgs;
          return { orderBy, id, minBurnFilter };
        }
        return { queryArgs };
      },

      merge(currentCacheData, responseData) {
        currentCacheData.allPostsByHashtagId.edges.push(...responseData.allPostsByHashtagId.edges);
        currentCacheData.allPostsByHashtagId.pageInfo = responseData.allPostsByHashtagId.pageInfo;
        currentCacheData.allPostsByHashtagId.totalCount = responseData.allPostsByHashtagId.totalCount;
      }
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
  useUpdatePostMutation
} = enhancedApi;
