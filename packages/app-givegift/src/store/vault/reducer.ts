import { createReducer } from "@reduxjs/toolkit"
import { createVault } from "./actions";
import { VaultsState } from "./state"

const initialState: VaultsState = {
  vaults: {
  }
};

export const vaultReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(createVault, (state, action) => {
      const vault = action.payload;
      const id: string = vault.redeemCode + '';
      state.vaults[id] = vault;
    })
})