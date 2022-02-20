import { Vault } from '@abcpros/givegift-models/lib/vault';
import { createEntityAdapter, createReducer, Update } from '@reduxjs/toolkit';

import {
  importAccountSuccess,
  selectAccountSuccess,
  refreshVaultListSuccess,
} from '../account/actions';
import {
  lockVaultSuccess,
  refreshVaultSuccess,
  selectVaultSuccess,
  setVault,
  setVaultBalance,
  unlockVaultSuccess,
} from './actions';
import { VaultsState } from './state';

export const vaultsAdapter = createEntityAdapter<Vault>({});

const initialState: VaultsState = vaultsAdapter.getInitialState({
  selectedId: 0,
  redeemIdsById: {},
});

const refreshVaultList = (vaults: Vault[], state) => {
  const vaultIds = vaults.map((vault) => vault.id);
  vaultsAdapter.upsertMany(state, vaults);
  if (vaultIds.length == 0 || !vaultIds.includes(state.selectedId)) {
    // The current selected vault is not the same anymore
    // Reset the selected vault
    state.selectedId = 0;
  }
};

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
          ...vault,
        },
      };
      vaultsAdapter.updateOne(state, updateVault);
      const redeemIds = redeems.map((redeem) => redeem.id);
      state.redeemIdsById[vault.id] = redeemIds;
    })
    .addCase(refreshVaultSuccess, (state, action) => {
      const { vault, redeems } = action.payload;
      const updateVault: Update<Vault> = {
        id: vault.id,
        changes: {
          ...vault,
        },
      };
      vaultsAdapter.updateOne(state, updateVault);
      const redeemIds = action.payload.redeems.map((redeem) => redeem.id);
      state.redeemIdsById[vault.id] = redeemIds;
    })
    .addCase(selectAccountSuccess, (state, action) => {
      const { vaults } = action.payload;
      refreshVaultList(vaults, state);
    })
    .addCase(refreshVaultListSuccess, (state, action) => {
      const { vaults } = action.payload;
      refreshVaultList(vaults, state);
    })
    .addCase(importAccountSuccess, (state, action) => {
      const { vaults } = action.payload;
      refreshVaultList(vaults, state);
    })
    .addCase(lockVaultSuccess, (state, action) => {
      const vault = action.payload;
      const updateVault: Update<Vault> = {
        id: vault.id,
        changes: {
          status: vault.status,
        },
      };
      vaultsAdapter.updateOne(state, updateVault);
    })
    .addCase(unlockVaultSuccess, (state, action) => {
      const vault = action.payload;
      const updateVault: Update<Vault> = {
        id: vault.id,
        changes: {
          status: vault.status,
        },
      };
      vaultsAdapter.updateOne(state, updateVault);
    })
    .addCase(setVaultBalance, (state, action) => {
      const selectedId = state.selectedId;
      if (selectedId) {
        const updateVault: Update<Vault> = {
          id: selectedId,
          changes: {
            balance: action.payload,
          },
        };
        vaultsAdapter.updateOne(state, updateVault);
      }
    });
});
