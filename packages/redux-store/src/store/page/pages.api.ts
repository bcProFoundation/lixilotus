import { api } from './pages.generated';

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['Page'],
  endpoints: {
    Pages: {
      providesTags: ['Page'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { orderBy, ...otherArgs } = queryArgs;
          return { orderBy };
        }
        return { queryArgs };
      },
      merge(currentCacheData, responseData) {
        currentCacheData.allPages.edges.push(...responseData.allPages.edges);
        currentCacheData.allPages.pageInfo = responseData.allPages.pageInfo;
        currentCacheData.allPages.totalCount = responseData.allPages.totalCount;
      }
    },
    Page: {
      providesTags: ['Page']
    },
    createPage: {
      invalidatesTags: ['Page']
    },
    updatePage: {
      invalidatesTags: ['Page']
    }
  }
});

export { enhancedApi as api };

export const {
  usePageQuery,
  useLazyPageQuery,
  usePagesQuery,
  useLazyPagesQuery,
  useCreatePageMutation,
  useUpdatePageMutation
} = enhancedApi;
