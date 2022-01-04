import { createEntityAdapter, createReducer, Update } from "@reduxjs/toolkit"
import { Vault } from "@abcpros/givegift-models/lib/vault";
import { refreshVaultSuccess, selectVaultSuccess, setVault } from "./actions";
import { VaultsState } from "./state"
import { selectAccountSuccess } from "../account/actions";

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
      vaultsAdapter.upsertOne(state, vault);
      state.selectedId = vault.id ?? undefined;
    })
    .addCase(selectVaultSuccess, (state, action) => {
      const { vault, redeems } = action.payload;
      state.selectedId = vault.id;
      const updateVault: Update<Vault> = {
        id: vault.id,
        changes: {
          ...vault
        }
      };
      vaultsAdapter.updateOne(state, updateVault);
      const redeemIds = redeems.map(redeem => redeem.id);
      state.redeemIdsById[vault.id] = redeemIds;
    })
    .addCase(refreshVaultSuccess, (state, action) => {
      const { vault, redeems } = action.payload;
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
    .addCase(selectAccountSuccess, (state, action) => {
      const { vaults } = action.payload;
      const vaultIds = vaults.map(vault => vault.id);
      vaultsAdapter.upsertMany(state, vaults);
      if (vaultIds.length == 0 || !vaultIds.includes(state.selectedId)) {
        // The current selected vault is not the same anymore
        // Reset the selected vault
        state.selectedId = 0;
      }
    })
})