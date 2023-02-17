import { api } from './tokens.generated';

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['Token'],
  endpoints: {
    Tokens: {
      providesTags: ['Token']
    },
    Token: {
      providesTags: ['Token']
    },
    createToken: {
      invalidatesTags: ['Token']
    }
  }
});

export { enhancedApi as api };

export const { useTokenQuery, useLazyTokenQuery, useTokensQuery, useLazyTokensQuery, useCreateTokenMutation } =
  enhancedApi;
