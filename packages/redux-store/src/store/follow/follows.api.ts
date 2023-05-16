import { api } from './follows.generated';

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['FollowAccount', 'FollowPage'],
  endpoints: {
    checkIsFollowedAccount: {},
    checkIsFollowedPage: {},
    createFollowAccount: {},
    createFollowPage: {},
    deleteFollowAccount: {},
    deleteFollowPage: {}
  }
});

export { enhancedApi as api };

export const {
  useCheckIsFollowedAccountQuery,
  useLazyCheckIsFollowedAccountQuery,
  useCheckIsFollowedPageQuery,
  useLazyCheckIsFollowedPageQuery,
  useCreateFollowAccountMutation,
  useCreateFollowPageMutation,
  useDeleteFollowAccountMutation,
  useDeleteFollowPageMutation
} = enhancedApi;
