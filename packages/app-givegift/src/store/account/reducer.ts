import { Account } from "@abcpros/givegift-models/lib/account";
import { createEntityAdapter, createReducer } from "@reduxjs/toolkit";
import { AccountsState } from "./state";

export const accountAdapter = createEntityAdapter<Account>({
})

const initialState: AccountsState = accountAdapter.getInitialState({
    selectedId: 0,
    vaultIdsById: {},
    activeId: 0
});

export const accountReducer = createReducer(initialState, (builder) => {
});