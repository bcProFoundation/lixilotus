import { api } from './pages.generated';

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['Page'],
  endpoints: {
    Pages: {
      providesTags: ['Page']
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
