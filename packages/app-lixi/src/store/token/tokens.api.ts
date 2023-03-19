import { api } from './tokens.generated';

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['Token'],
  endpoints: {
    Tokens: {
      providesTags: ['Token']
    },
    Token: {
      providesTags: ['Token'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { tokenId, ...otherArgs } = queryArgs;
          return { tokenId };
        }
        return { queryArgs };
      }
    },
    createToken: {
      invalidatesTags: ['Token']
    }
  }
});

export { enhancedApi as api };

export const { useTokenQuery, useLazyTokenQuery, useTokensQuery, useLazyTokensQuery, useCreateTokenMutation } =
  enhancedApi;
