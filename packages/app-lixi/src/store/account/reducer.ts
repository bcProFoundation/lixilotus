import { Account } from '@bcpros/lixi-models';
import { createEntityAdapter, createReducer, isAnyOf, Update } from '@reduxjs/toolkit';
import { UPLOAD_TYPES } from '@bcpros/lixi-models/constants';
import {
  deleteAccountSuccess,
  importAccountSuccess,
  renameAccountSuccess,
  selectAccountSuccess,
  setAccount,
  refreshLixiListSuccess,
  setUpload,
  removeUpload,
  refreshLixiListSilentSuccess
} from './actions';
import { AccountsState } from './state';

export const accountsAdapter = createEntityAdapter<Account>({});

const initialState: AccountsState = accountsAdapter.getInitialState({
  selectedId: null,
  lixiIdsById: {},
  envelopeUpload: null,
  pageAvatarUpload: null,
  pageCoverUpload: null
});

export const accountReducer = createReducer(initialState, builder => {
  builder
    .addCase(setAccount, (state, action) => {
      const account = action.payload;
      accountsAdapter.upsertOne(state, account);
      state.selectedId = account.id ?? null;
    })
    .addCase(selectAccountSuccess, (state, action) => {
      const { account, lixies } = action.payload;
      const id = account.id;
      state.selectedId = id;
      const lixiIds = lixies.map(lixi => lixi.id);
      state.lixiIdsById[id] = lixiIds;
      accountsAdapter.upsertOne(state, account);
    })
    .addCase(importAccountSuccess, (state, action) => {
      const { account, lixies } = action.payload;
      const id = account.id;
      state.selectedId = id;
      const lixiIds = lixies.map(lixi => lixi.id);
      state.lixiIdsById[id] = lixiIds;
      accountsAdapter.upsertOne(state, account);
    })
    .addCase(renameAccountSuccess, (state, action) => {
      const account = action.payload;
      const updateAccount: Update<Account> = {
        id: account.id,
        changes: {
          ...account
        }
      };
      accountsAdapter.updateOne(state, updateAccount);
    })
    .addCase(deleteAccountSuccess, (state, action) => {
      accountsAdapter.removeOne(state, action.payload);
    })
    .addCase(setUpload, (state, action) => {
      const { type, upload } = action.payload;

      switch (type) {
        case UPLOAD_TYPES.ENVELOPE:
          state.envelopeUpload = upload;
          break;
        case UPLOAD_TYPES.PAGE_AVATAR:
          state.pageAvatarUpload = upload;
          break;
        case UPLOAD_TYPES.PAGE_COVER:
          state.pageCoverUpload = upload;
          break;
      }
    })
    .addCase(removeUpload, (state, action) => {
      const { type } = action.payload;

      switch (type) {
        case UPLOAD_TYPES.ENVELOPE:
          state.envelopeUpload = null;
          break;
        case UPLOAD_TYPES.PAGE_AVATAR:
          state.pageAvatarUpload = null;
          break;
        case UPLOAD_TYPES.PAGE_COVER:
          state.pageCoverUpload = null;
          break;
      }
    })
    .addMatcher(isAnyOf(refreshLixiListSuccess, refreshLixiListSilentSuccess), (state, action) => {
      const { account, lixies } = action.payload;
      const id = account.id;
      state.selectedId = id;
      const lixiIds = lixies.map(lixi => lixi.id);
      state.lixiIdsById[id] = lixiIds;
      accountsAdapter.upsertOne(state, account);
    });
});
