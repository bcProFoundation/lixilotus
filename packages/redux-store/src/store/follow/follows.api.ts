import { api } from './follows.generated';

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['FollowAccount', 'FollowPage'],
  endpoints: {
    createFollowAccount: {},
    createFollowPage: {}
  }
});

export { enhancedApi as api };

export const { useCreateFollowAccountMutation, useCreateFollowPageMutation } = enhancedApi;
