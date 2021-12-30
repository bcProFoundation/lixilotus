import { createAction } from "@reduxjs/toolkit";
import { Account } from "@abcpros/givegift-models/lib/account";

export const generateAccount = createAction('account/generateAccount');
export const getAccount = createAction<Account>('vault/getAccount');
export const getAccountSuccess = createAction<Account>('vault/getAccountSuccess');
export const getAccountFailure = createAction<string>('vault/getAccountFailure');
export const postAccount = createAction<Account>('account/postAccount');
export const postAccountSuccess = createAction<Account>('vault/postAccountSuccess');
export const postAccountFailure = createAction<string>('vault/postAccountFailure');
export const setAccount = createAction<Account>('vault/setAccount');
export const selectAccount = createAction<number>('vault/selectAccount');
export const importAccount = createAction<string>('account/importAccount');
export const importAccountSuccess = createAction<Account>('account/importAccountSuccess');
export const importAccountFailure = createAction<string>('account/importAccountFailure');