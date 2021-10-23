import { createAction } from '@reduxjs/toolkit';
import { GenerateVaultDto, VaultApi, Vault } from '@abcpros/givegift-models/lib/vault';

export const generateVault = createAction<GenerateVaultDto>('vault/generateVault');
export const getVault = createAction<Vault>('vault/getVault');
export const getVaultSuccess = createAction<Vault>('vault/getVaultSuccess');
export const getVaultFailure = createAction<string>('vault/getVaultFailure');
export const postVault = createAction<Vault>('vault/postVault');
export const postVaultSuccess = createAction<Vault>('vault/postVaultSuccess');
export const postVaultFailure = createAction<string>('vault/postVaultFailure');
export const setVault = createAction<Vault>('vault/setVault');
export const selectVault = createAction<number>('vault/selectVault');

