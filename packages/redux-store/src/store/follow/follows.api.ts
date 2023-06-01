import { api } from './follows.generated';

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['FollowAccount', 'FollowPage'],
  endpoints: {
    checkIfFollowAccount: {},
    checkIfFollowPage: {},
    createFollowAccount: {},
    createFollowPage: {},
    deleteFollowAccount: {},
    deleteFollowPage: {}
  }
});

export { enhancedApi as api };

export const {
  useCheckIfFollowAccountQuery,
  useLazyCheckIfFollowAccountQuery,
  useCheckIfFollowPageQuery,
  useLazyCheckIfFollowPageQuery,
  useCreateFollowAccountMutation,
  useCreateFollowPageMutation,
  useDeleteFollowAccountMutation,
  useDeleteFollowPageMutation
} = enhancedApi;
