import { createEntityAdapter, createReducer } from "@reduxjs/toolkit"
import { Redeem } from "@bcpros/lixi-models/lib/redeem";
import { RedeemsState } from "./state";
import { refreshVaultSuccess } from "../vault/actions";
import { saveRedeemAddress, saveRedeemCode, viewRedeemFailure, viewRedeemSuccess } from "./actions";


export const redeemsAdapter = createEntityAdapter<Redeem>({
})


const initialState: RedeemsState = redeemsAdapter.getInitialState({
  currentAddress: '',
  currentRedeemCode: '',
  currentLixiRedeem: undefined
});

export const redeemReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(refreshVaultSuccess, (state, action) => {
      const redeems = action.payload.redeems;
      redeemsAdapter.setAll(state, redeems);
    })
    .addCase(saveRedeemAddress, (state, action) => {
      state.currentAddress = action.payload;
    })
    .addCase(saveRedeemCode, (state, action) => {
      state.currentRedeemCode = action.payload;
    })
    .addCase(viewRedeemSuccess, (state, action) => {
      state.currentLixiRedeem = action.payload;
    })
    .addCase(viewRedeemFailure, (state, action) => {
      state.currentLixiRedeem = undefined;
    })
})