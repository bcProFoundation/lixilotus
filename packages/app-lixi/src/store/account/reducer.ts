import { Account } from '@bcpros/lixi-models';
import { createEntityAdapter, createReducer, isAnyOf, Update } from '@reduxjs/toolkit';

import {
  deleteAccountSuccess,
  importAccountSuccess,
  renameAccountSuccess,
  selectAccountSuccess,
  setAccount,
  setAccountBalance,
  refreshLixiListSuccess,
  setUploadedImageId,
  removeUploadedImageId,
  refreshLixiListSilentSuccess
} from './actions';
import { AccountsState } from './state';

export const accountsAdapter = createEntityAdapter<Account>({});

const initialState: AccountsState = accountsAdapter.getInitialState({
  selectedId: null,
  lixiIdsById: {},
  uploadedImageId: null
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
    .addCase(setAccountBalance, (state, action) => {
      const selectedId = state.selectedId;
      if (selectedId) {
        const updateAccount: Update<Account> = {
          id: selectedId,
          changes: {
            balance: action.payload
          }
        };
        accountsAdapter.updateOne(state, updateAccount);
      }
    })
    .addCase(setUploadedImageId, (state, action) => {
      state.uploadedImageId = action.payload.id
    })
    .addCase(removeUploadedImageId, (state, action) => {
      state.uploadedImageId = null;
    }).addMatcher(isAnyOf(refreshLixiListSuccess, refreshLixiListSilentSuccess), (state, action) => {
      const { account, lixies } = action.payload;
      const id = account.id;
      state.selectedId = id;
      const lixiIds = lixies.map(lixi => lixi.id);
      state.lixiIdsById[id] = lixiIds;
      accountsAdapter.upsertOne(state, account);
    });
});
