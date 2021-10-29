import { createAction } from '@reduxjs/toolkit';
import { GenerateVaultDto, Vault, ImportVaultDto } from '@abcpros/givegift-models/lib/vault';
import { Redeem } from '@abcpros/givegift-models/lib/redeem';

export const generateVault = createAction<GenerateVaultDto>('vault/generateVault');
export const getVault = createAction<Vault>('vault/getVault');
export const getVaultSuccess = createAction<Vault>('vault/getVaultSuccess');
export const getVaultFailure = createAction<string>('vault/getVaultFailure');
export const postVault = createAction<Vault>('vault/postVault');
export const postVaultSuccess = createAction<Vault>('vault/postVaultSuccess');
export const postVaultFailure = createAction<string>('vault/postVaultFailure');
export const setVault = createAction<Vault>('vault/setVault');
export const selectVault = createAction<number>('vault/selectVault');
export const importVault = createAction<ImportVaultDto>('vault/importVault');
export const importVaultSuccess = createAction<Vault>('vault/importVaultSuccess');
export const importVaultFailure = createAction<string>('vault/importVaultFailure');
export const refreshVault = createAction<number>('vault/refreshVault');
export const refreshVaultSuccess = createAction<{ vault: Vault, redeems: Redeem[] }>('vault/refreshVaultSuccess');
export const refreshVaultFailure = createAction<string>('vault/refreshVaultFailure');