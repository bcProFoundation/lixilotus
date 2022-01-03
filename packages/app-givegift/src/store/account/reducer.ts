import { createEntityAdapter, createReducer, Update } from "@reduxjs/toolkit";
import { Account } from "@abcpros/givegift-models";
import { deleteAccountSuccess, renameAccountSuccess, selectAccountSuccess, setAccount } from "./actions";
import { AccountsState } from "./state";

export const accountsAdapter = createEntityAdapter<Account>({
})

const initialState: AccountsState = accountsAdapter.getInitialState({
  selectedId: undefined,
  vaultIdsById: {}
});

export const accountReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setAccount, (state, action) => {
      const account = action.payload;
      accountsAdapter.upsertOne(state, account);
      state.selectedId = account.id ?? undefined;
    })
    .addCase(selectAccountSuccess, (state, action) => {
      const { account, vaults } = action.payload;
      const id = account.id;
      state.selectedId = id;
      const vaultIds = vaults.map(vault => vault.id);
      state.vaultIdsById[id] = vaultIds;
      const updateAccount: Update<Account> = {
        id,
        changes: {
          ...account
        }
      };
      accountsAdapter.updateOne(state, updateAccount);
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
});