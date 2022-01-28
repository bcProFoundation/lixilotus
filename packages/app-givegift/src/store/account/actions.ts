import {
  Account, CreateAccountCommand, DeleteAccountCommand, RenameAccountCommand, Vault
} from '@abcpros/givegift-models';
import { createAction } from '@reduxjs/toolkit';

import { AppThunk } from '../store';

export const generateAccount = createAction('account/generateAccount');
export const getAccount = createAction<number>('account/getAccount');
export const getAccountSuccess = createAction<Account>('account/getAccountSuccess');
export const getAccountFailure = createAction<string>('account/getAccountFailure');
export const postAccount = createAction<CreateAccountCommand>('account/postAccount');
export const postAccountSuccess = createAction<Account>('account/postAccountSuccess');
export const postAccountFailure = createAction<string>('account/postAccountFailure');
export const setAccount = createAction<Account>('account/setAccount');
export const selectAccount = createAction<number>('account/selectAccount');
export const selectAccountSuccess = createAction<{ account: Account, vaults: Vault[] }>('account/selectAccountSuccess');
export const selectAccountFailure = createAction<string>('account/selectAccountFailure');
export const importAccount = createAction<string>('account/importAccount');
export const importAccountSuccess = createAction<{ account: Account, vaults: Vault[] }>('account/importAccountSuccess');
export const importAccountFailure = createAction<string>('account/importAccountFailure');
export const renameAccount = createAction<RenameAccountCommand>('account/renameAccount');
export const renameAccountSuccess = createAction<Account>('account/renameAccountSuccess');
export const renameAccountFailure = createAction<string>('account/renameAccountFailure');
export const deleteAccount = createAction<DeleteAccountCommand>('account/deleteAccount');
export const deleteAccountSuccess = createAction<number>('account/deleteAccountSuccess');
export const deleteAccountFailure = createAction<string>('account/deleteAccountFailure');
export const setAccountBalance = createAction<number>('account/setAccountBalance');

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