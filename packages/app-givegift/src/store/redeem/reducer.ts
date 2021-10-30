import { createEntityAdapter, createReducer } from "@reduxjs/toolkit"
import { Redeem } from "@abcpros/givegift-models/lib/redeem";
import { RedeemsState } from "./state";
import { refreshVaultSuccess } from "../vault/actions";


export const redeemsAdapter = createEntityAdapter<Redeem>({
})


const initialState: RedeemsState = redeemsAdapter.getInitialState({
});

export const redeemReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(refreshVaultSuccess, (state, action) => {
      const redeems = action.payload.redeems;
      redeemsAdapter.setAll(state, redeems);
    })
})