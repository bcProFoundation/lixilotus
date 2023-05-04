import { api } from './tokens.generated';

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['Token'],
  endpoints: {
    Tokens: {
      providesTags: ['Token'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { orderBy, ...otherArgs } = queryArgs;
          return orderBy;
        }
        return { queryArgs };
      }
    },
    Token: {
      providesTags: (result, error, arg) => ['Token']
    },
    createToken: {
      invalidatesTags: ['Token']
    }
  }
});

export { enhancedApi as api };

export const { useTokenQuery, useLazyTokenQuery, useTokensQuery, useLazyTokensQuery, useCreateTokenMutation } =
  enhancedApi;
