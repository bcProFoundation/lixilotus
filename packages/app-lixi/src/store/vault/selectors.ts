import { Vault } from "@bcpros/lixi-models";
import { createSelector } from "reselect";
import { AccountsState } from "../account/state";
import { RootState } from "../store";
import { vaultsAdapter } from "./reducer";
import { VaultsState } from "./state";


const selectAccounts = (state: RootState) => state.accounts as AccountsState;

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
  (state: RootState) => state.vaults as VaultsState,
  selectAll
);

export const getAllVaultsEntities = createSelector(
  (state: RootState) => state.vaults as VaultsState,
  selectEntities
);

export const getSelectedVaultId = createSelector(
  (state: RootState) => state.vaults as VaultsState,
  (vaults: VaultsState) => vaults.selectedId
);

export const getVaultById = (id: number) => createSelector(
  selectEntities,
  (vaults) => vaults[id]
)

export const getVaultsBySelectedAccount = createSelector(
  [selectSelectedAccount, getAllVaults],
  (accountId, vaults) => vaults.filter(vault => vault.accountId === accountId) as Vault[]
);

// export const getSelectedVault = createSelector(
//   [getVaultsBySelectedAccount, getSelectedVaultId],
//   (vaults, selectedVaultId) => vaults.find(vault => vault.id === selectedVaultId)
// );