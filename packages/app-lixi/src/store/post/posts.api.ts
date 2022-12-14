import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { PageInfo, OrderDirection, PostOrderField } from 'src/generated/types.generated';
import { api, PostsQuery, PostQuery } from './posts.generated';

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
    Post: {
      providesTags: (result, error, arg) => ['Post']
    },
    createPost: {
      invalidatesTags: ['Post'],
      async onQueryStarted({ input }, { dispatch, queryFulfilled }) {
        try {
          const params = {
            first: 20,
            orderBy: {
              direction: OrderDirection.Desc,
              field: PostOrderField.UpdatedAt
            }
          };
          const { data: createdPost } = await queryFulfilled;
          const patchResult = dispatch(
            api.util.updateQueryData('Posts', params, draft => {
              draft.allPosts.edges.unshift({
                cursor: createdPost.createPost.id,
                node: {
                  ...createdPost.createPost
                }
              });
              draft.allPosts.totalCount = draft.allPosts.totalCount + 1;
            })
          );
        } catch {}
      }
    }
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
  useCreatePostMutation
} = enhancedApi;
