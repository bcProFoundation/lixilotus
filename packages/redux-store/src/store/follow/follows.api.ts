import { api } from './follows.generated';

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['FollowAccount', 'FollowPage'],
  endpoints: {
    checkFollowAccount: {},
    createFollowAccount: {},
    createFollowPage: {}
  }
});

export { enhancedApi as api };

export const { useCheckFollowAccountQuery, useCreateFollowAccountMutation, useCreateFollowPageMutation } = enhancedApi;
