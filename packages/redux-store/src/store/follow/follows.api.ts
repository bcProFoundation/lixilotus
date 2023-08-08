import { api } from './follows.generated';

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['FollowAccount', 'FollowPage'],
  endpoints: {
    checkIfFollowAccount: {},
    checkIfFollowPage: {},
    createFollowAccount: {},
    createFollowPage: {
      async onQueryStarted({ input }, { dispatch, queryFulfilled }) {
        const { pageId } = input;
        try {
          await queryFulfilled;
          dispatch(
            api.util.updateQueryData('checkIfFollowPage', { pageId: pageId }, draft => {
              draft.checkIfFollowPage = true;
            })
          );
        } catch {}
      }
    },
    createFollowToken: {},
    deleteFollowAccount: {},
    deleteFollowPage: {
      async onQueryStarted({ input }, { dispatch, queryFulfilled }) {
        const { pageId } = input;
        try {
          await queryFulfilled;
          dispatch(
            api.util.updateQueryData('checkIfFollowPage', { pageId: pageId }, draft => {
              draft.checkIfFollowPage = false;
            })
          );
        } catch {}
      }
    },
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
