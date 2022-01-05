import { Vault } from "@abcpros/givegift-models";
import { createSelector } from "reselect";
import { RootState, store } from "../store";
import { vaultsAdapter } from "./reducer";
import { VaultsState } from "./state";


const selectAccounts = (state: RootState) => state.accounts;

const selectSelectedAccount = createSelector(
  selectAccounts,
  (state) => state.selectedId
)

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

export const getVaultById = (id: number) => createSelector(
  selectEntities,
  (vaults) => vaults[id]
)

export const getVaultsBySelectedAccount = createSelector(
  [selectSelectedAccount, getAllVaults],
  (accountId, vaults) => vaults.filter(vault => vault.accountId === accountId)
)

export const getSelectedVault = createSelector(
  [getVaultsBySelectedAccount, getSelectedVaultId],
  (vaults: Vault[], selectedVaultId: number) => vaults.find(vault => vault.id === selectedVaultId)
)