import { createAction } from '@reduxjs/toolkit';
import { Vault } from '@abcpros/givegift-models/lib/vault';

export const createVault = createAction<Vault>('vault/createVault');