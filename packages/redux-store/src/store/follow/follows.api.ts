import { api } from './follows.generated';

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['FollowAccount', 'FollowPage'],
  endpoints: {
    createFollowAccount: {},
    createFollowPage: {},
    deleteFollowAccount: {},
    deleteFollowPage: {}
  }
});

export { enhancedApi as api };

export const {
  useCreateFollowAccountMutation,
  useCreateFollowPageMutation,
  useDeleteFollowAccountMutation,
  useDeleteFollowPageMutation
} = enhancedApi;
