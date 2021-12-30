import { Account } from "@abcpros/givegift-models/lib/account";
import { createEntityAdapter, createReducer } from "@reduxjs/toolkit";
import { setAccount } from "./actions";
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
});