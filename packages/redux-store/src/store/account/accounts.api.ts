import { api } from './accounts.generated';

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['Account'],
  endpoints: {
    Accounts: {
      providesTags: ['Account'],
      serializeQueryArgs({ queryArgs }) {
        if (queryArgs) {
          const { orderBy, ...otherArgs } = queryArgs;
          return orderBy;
        }
        return { queryArgs };
      }
    },
    Account: {
      providesTags: (result, error, arg) => ['Account']
    },
    createAccount: {
      invalidatesTags: ['Account']
    }
  }
});

export { enhancedApi as api };

export const {
  useAccountQuery,
  useLazyAccountQuery,
  useAccountsQuery,
  useLazyAccountsQuery,
  useCreateAccountMutation
} = enhancedApi;
