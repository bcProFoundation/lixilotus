import { Account, GenerateAccountDto } from "@abcpros/givegift-models/src/lib/account";
import { createAction } from "@reduxjs/toolkit";

export const generateAccount = createAction<GenerateAccountDto>('account/generateAccount');
export const postAccount = createAction<Account>('account/postAccount');
export const postAccountSuccess = createAction<Account>('vault/postAccountSuccess');
export const postAccountFailure = createAction<string>('vault/postAccountFailure');
export const getAccountSuccess = createAction<Account>('account/getAccountSuccess');
export const importAccount = createAction<Account>('account/importAccount');
export const importAccountSuccess = createAction<Account>('account/importAccountSuccess');