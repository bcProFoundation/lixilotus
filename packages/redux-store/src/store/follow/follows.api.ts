import { api } from './follows.generated';

const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ['FollowAccount', 'FollowPage'],
  endpoints: {
    checkIfFollowAccount: {},
    checkIfFollowPage: {},
    checkIfFollowToken: {},
    createFollowAccount: {
      async onQueryStarted({ input }, { dispatch, queryFulfilled }) {
        const { followingAccountId } = input;
        try {
          await queryFulfilled;
          dispatch(
            api.util.updateQueryData('checkIfFollowAccount', { followingAccountId }, draft => {
              draft.checkIfFollowAccount = true;
            })
          );
        } catch {}
      }
    },
    createFollowPage: {
      async onQueryStarted({ input }, { dispatch, queryFulfilled }) {
        const { pageId } = input;
        try {
          await queryFulfilled;
          dispatch(
            api.util.updateQueryData('checkIfFollowPage', { pageId }, draft => {
              draft.checkIfFollowPage = true;
            })
          );
        } catch {}
      }
    },
    createFollowToken: {
      async onQueryStarted({ input }, { dispatch, queryFulfilled }) {
        const { tokenId } = input;
        try {
          await queryFulfilled;
          dispatch(
            api.util.updateQueryData('checkIfFollowToken', { tokenId }, draft => {
              draft.checkIfFollowToken = true;
            })
          );
        } catch {}
      }
    },
    deleteFollowAccount: {
      async onQueryStarted({ input }, { dispatch, queryFulfilled }) {
        const { followingAccountId } = input;
        try {
          await queryFulfilled;
          dispatch(
            api.util.updateQueryData('checkIfFollowAccount', { followingAccountId }, draft => {
              draft.checkIfFollowAccount = false;
            })
          );
        } catch {}
      }
    },
    deleteFollowPage: {
      async onQueryStarted({ input }, { dispatch, queryFulfilled }) {
        const { pageId } = input;
        try {
          await queryFulfilled;
          dispatch(
            api.util.updateQueryData('checkIfFollowPage', { pageId }, draft => {
              draft.checkIfFollowPage = false;
            })
          );
        } catch {}
      }
    },
    deleteFollowToken: {
      async onQueryStarted({ input }, { dispatch, queryFulfilled }) {
        const { tokenId } = input;
        try {
          await queryFulfilled;
          dispatch(
            api.util.updateQueryData('checkIfFollowToken', { tokenId }, draft => {
              draft.checkIfFollowToken = false;
            })
          );
        } catch {}
      }
    }
  }
});

export { enhancedApi as api };

export const {
  useCheckIfFollowAccountQuery,
  useLazyCheckIfFollowAccountQuery,
  useCheckIfFollowPageQuery,
  useLazyCheckIfFollowPageQuery,
  useCheckIfFollowTokenQuery,
  useLazyCheckIfFollowTokenQuery,
  useCreateFollowAccountMutation,
  useCreateFollowPageMutation,
  useDeleteFollowAccountMutation,
  useDeleteFollowPageMutation,
  useCreateFollowTokenMutation,
  useDeleteFollowTokenMutation
} = enhancedApi;
