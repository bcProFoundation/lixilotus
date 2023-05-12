import { api } from './accounts.generated';

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['Account'],
  endpoints: {
    getAccountByAddress: {
      providesTags: (result, error, arg) => ['Account']
    },
    createAccount: {
      invalidatesTags: ['Account']
    }
  }
});

export { enhancedApi as api };

export const {
  useGetAccountByAddressQuery,
  useLazyGetAccountByAddressQuery,
  useCreateAccountMutation,
  useImportAccountMutation
} = enhancedApi;
