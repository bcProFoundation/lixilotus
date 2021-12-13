import { createSelector } from "reselect";
import { RootState, store } from "../store";
import { vaultsAdapter } from "./reducer";
import { VaultsState } from "./state";


const {
  selectAll,
  selectEntities,
  selectIds,
  selectTotal
} = vaultsAdapter.getSelectors();

export const getAllVaults = createSelector(
  (state: RootState) => state.vaults,
  selectAll
);

export const getAllVaultsEntities = createSelector(
  (state: RootState) => state.vaults,
  selectEntities
);

export const getSelectedVaultId = createSelector(
  (state: RootState) => state.vaults,
  (vaults: VaultsState) => vaults.selectedId
);

export const getSelectedVault = createSelector(
  (state: RootState) => state.vaults,
  (vaults: VaultsState) => vaults.entities[vaults.selectedId]
)

export const getVaultById = (id: number) => createSelector(
  selectEntities,
  (vaults) => vaults[id]
)