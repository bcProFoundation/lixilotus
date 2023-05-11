import { api } from './accounts.generated';

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['Account'],
  endpoints: {
    getAccountViaAddress: {
      providesTags: (result, error, arg) => ['Account']
    },
    createAccount: {
      invalidatesTags: ['Account']
    }
  }
});

export { enhancedApi as api };

export const {
  useGetAccountViaAddressQuery,
  useLazyGetAccountViaAddressQuery,
  useCreateAccountMutation,
  useImportAccountMutation
} = enhancedApi;
