import { api } from './follows.generated';

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['FollowAccount', 'FollowPage'],
  endpoints: {
    checkIfFollowAccount: {},
    checkIfFollowPage: {},
    createFollowAccount: {},
    createFollowPage: {},
    createFollowToken: {},
    deleteFollowAccount: {},
    deleteFollowPage: {},
    deleteFollowToken: {}
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
  useDeleteFollowPageMutation,
  useCreateFollowTokenMutation,
  useDeleteFollowTokenMutation
} = enhancedApi;
