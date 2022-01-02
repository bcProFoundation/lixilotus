import { createAction } from "@reduxjs/toolkit";
import { Account, Vault, CreateAccountCommand, RenameAccountCommand } from "@abcpros/givegift-models";
import { AppThunk } from "../store";

export const generateAccount = createAction('account/generateAccount');
export const getAccount = createAction<Account>('vault/getAccount');
export const getAccountSuccess = createAction<Account>('vault/getAccountSuccess');
export const getAccountFailure = createAction<string>('vault/getAccountFailure');
export const postAccount = createAction<CreateAccountCommand>('account/postAccount');
export const postAccountSuccess = createAction<Account>('vault/postAccountSuccess');
export const postAccountFailure = createAction<string>('vault/postAccountFailure');
export const setAccount = createAction<Account>('vault/setAccount');
export const selectAccount = createAction<number>('vault/selectAccount');
export const selectAccountSuccess = createAction<{ account: Account, vaults: Vault[] }>('vault/selectAccountSuccess');
export const selectAccountFailure = createAction<string>('vault/selectAccountFailure');
export const importAccount = createAction<string>('account/importAccount');
export const importAccountSuccess = createAction<Account>('account/importAccountSuccess');
export const importAccountFailure = createAction<string>('account/importAccountFailure');
export const renameAccount = createAction<RenameAccountCommand>('account/renameAccount');
export const renameAccountSuccess = createAction<Account>('account/renameAccountSuccess');
export const renameAccountFailure = createAction<string>('account/renameAccountFailure');

// Thunk action creators
// Not use currently
export const renameAccountThunk = (name: string, prebuiltCommand: RenameAccountCommand): AppThunk => (dispatch) => {
  if (prebuiltCommand) {
    const command: RenameAccountCommand = {
      ...prebuiltCommand,
      name: name
    };
    dispatch(renameAccount(command));
  }
}