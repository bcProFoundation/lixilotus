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
  removeAllUpload,
  refreshLixiListSilentSuccess,
  saveEditorTextToCache,
  deleteEditorTextFromCache,
  getTopFiveSuccess
} from './actions';
import { AccountsState } from './state';

export const accountsAdapter = createEntityAdapter<Account>({});

const initialState: AccountsState = accountsAdapter.getInitialState({
  selectedId: null,
  lixiIdsById: {},
  envelopeUpload: null,
  pageAvatarUpload: null,
  pageCoverUpload: null,
  postCoverUploads: [],
  editorCache: null,
  leaderBoard: [],
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
        case UPLOAD_TYPES.POST:
          state.postCoverUploads.push(upload);
          break;
      }
    })
    .addCase(removeUpload, (state, action) => {
      const { type, id } = action.payload;

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
        case UPLOAD_TYPES.POST:
          state.postCoverUploads = state.postCoverUploads.filter(image => {
            return image.id !== id;
          });
          break;
      }
    })
    .addCase(removeAllUpload, (state, action) => {
      state.postCoverUploads.length = 0;
    })
    .addCase(saveEditorTextToCache, (state, action) => {
      const tempPost = action.payload;
      state.editorCache = tempPost;
    })
    .addCase(deleteEditorTextFromCache, (state, action) => {
      state.editorCache = '';
    })
    .addCase(getTopFiveSuccess, (state, action) => {
      state.leaderBoard = action.payload;
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
