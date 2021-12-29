import { createAction } from "@reduxjs/toolkit";
import { Account } from "@abcpros/givegift-models/lib/account";

export const generateAccount = createAction('account/generateAccount');
export const postAccount = createAction<Account>('account/postAccount');
export const postAccountSuccess = createAction<Account>('vault/postAccountSuccess');
export const postAccountFailure = createAction<string>('vault/postAccountFailure');
export const getAccountSuccess = createAction<Account>('account/getAccountSuccess');
export const importAccount = createAction<Account>('account/importAccount');
export const importAccountSuccess = createAction<Account>('account/importAccountSuccess');
export const importAccountFailure = createAction<Account>('account/importAccountFailure');