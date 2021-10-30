import { createEntityAdapter, createReducer, Update } from "@reduxjs/toolkit"
import { Vault } from "@abcpros/givegift-models/lib/vault";
import { refreshVaultSuccess, selectVault, setVault } from "./actions";
import { VaultsState } from "./state"

export const vaultsAdapter = createEntityAdapter<Vault>({
})


const initialState: VaultsState = vaultsAdapter.getInitialState({
  selectedId: 0,
  redeemIdsById: {}
});

export const vaultReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setVault, (state, action) => {
      const vault = action.payload;
      vaultsAdapter.addOne(state, vault);
      state.selectedId = vault.id;
    })
    .addCase(selectVault, (state, action) => {
      const id = action.payload;
      state.selectedId = id;
    })
    .addCase(refreshVaultSuccess, (state, action) => {
      const vault = action.payload.vault;
      const updateVault: Update<Vault> = {
        id: vault.id,
        changes: {
          ...vault
        }
      };
      vaultsAdapter.updateOne(state, updateVault);
      const redeemIds = action.payload.redeems.map(redeem => redeem.id);
      state.redeemIdsById[vault.id] = redeemIds;
    })
})