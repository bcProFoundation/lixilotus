import { createEntityAdapter, createReducer, Update } from "@reduxjs/toolkit";
import { Account } from "@abcpros/givegift-models";
import { selectAccountSuccess, setAccount } from "./actions";
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
      state.selectedId = account.id ?? 0;
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
});