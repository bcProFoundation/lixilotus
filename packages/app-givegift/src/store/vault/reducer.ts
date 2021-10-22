import { createEntityAdapter, createReducer } from "@reduxjs/toolkit"
import { Vault } from "@abcpros/givegift-models/lib/vault";
import { postVault, postVaultFailure, postVaultSuccess, setVault } from "./actions";
import { VaultsState } from "./state"

export const vaultsAdapter = createEntityAdapter<Vault>({
})


const initialState: VaultsState = vaultsAdapter.getInitialState({
  selectedId: 0
});

export const vaultReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setVault, (state, action) => {
      const vault = action.payload;
      vaultsAdapter.addOne(state, vault);
      state.selectedId = vault.id;
    })
    .addCase(postVaultFailure, (state, action) => {
      const message = action.payload;

    })
})