import {
  Account,
  CreateAccountCommand,
  DeleteAccountCommand,
  RenameAccountCommand,
  Lixi,
  ChangeAccountLocaleCommand,
  Upload,
  RegisterViaEmailNoVerifiedCommand,
  LoginViaEmailCommand
} from '@bcpros/lixi-models';
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
export const setAccountSuccess = createAction<Account>('account/setAccountSuccess');
export const selectAccount = createAction<number>('account/selectAccount');
export const selectAccountSuccess = createAction<{ account: Account; lixies: Lixi[] }>('account/selectAccountSuccess');
export const selectAccountFailure = createAction<string>('account/selectAccountFailure');
export const importAccount = createAction<string>('account/importAccount');
export const importAccountSuccess = createAction<{ account: Account; lixies: Lixi[] }>('account/importAccountSuccess');
export const importAccountFailure = createAction<string>('account/importAccountFailure');
export const renameAccount = createAction<RenameAccountCommand>('account/renameAccount');
export const renameAccountSuccess = createAction<Account>('account/renameAccountSuccess');
export const renameAccountFailure = createAction<string>('account/renameAccountFailure');
export const changeAccountLocale = createAction<ChangeAccountLocaleCommand>('account/changeAccountLocale');
export const changeAccountLocaleSuccess = createAction<Account>('account/changeAccountLocaleSuccess');
export const changeAccountLocaleFailure = createAction<string>('account/changeAccountLocaleFailure');
export const deleteAccount = createAction<DeleteAccountCommand>('account/deleteAccount');
export const deleteAccountSuccess = createAction<number>('account/deleteAccountSuccess');
export const deleteAccountFailure = createAction<string>('account/deleteAccountFailure');
export const refreshLixiList = createAction<any>('lixi/refreshLixiList');
export const refreshLixiListSuccess = createAction<{ account: Account; lixies: Lixi[] }>('lixi/refreshLixiListSuccess');
export const refreshLixiListFailure = createAction<string>('lixi/refreshLixiListFailure');
export const refreshLixiListSilent = createAction<any>('lixi/refreshLixiListSilent');
export const refreshLixiListSilentSuccess = createAction<{ account: Account; lixies: Lixi[] }>(
  'lixi/refreshLixiListSilentSuccess'
);
export const refreshLixiListSilentFailure = createAction<string>('lixi/refreshLixiListSilentFailure');
export const silentLogin = createAction<string>('account/silentLogin');
export const silentLoginSuccess = createAction('account/silentLoginSuccess');
export const silentLoginFailure = createAction('account/silentLoginFailure');
export const setUpload = createAction<{ upload: Upload; type: any }>('account/setUpload');
export const removeUpload = createAction<{ type: any; id?: string }>('account/removeUpload');
export const removeAllUpload = createAction('account/removeAllUpload');
export const loginViaEmail = createAction<LoginViaEmailCommand>('account/loginViaEmail');
export const loginViaEmailSuccess = createAction<any>('account/loginViaEmailSuccess');
export const loginViaEmailFailure = createAction<any>('account/loginViaEmailFailure');
export const registerViaEmailNoVerified = createAction<RegisterViaEmailNoVerifiedCommand>(
  'account/registerViaEmailNoVerified'
);
export const registerViaEmailNoVerifiedSuccess = createAction<any>('account/registerViaEmailNoVerifiedSuccess');
export const registerViaEmailNoVerifiedFailure = createAction<any>('account/registerViaEmailNoVerifiedFailure');
export const verifyEmail = createAction<LoginViaEmailCommand>('account/verifyEmail');
export const verifyEmailSuccess = createAction<any>('account/verifyEmailSuccess');
export const verifyEmailFailure = createAction<any>('account/verifyEmailFailure');
export const saveEditorTextToCache = createAction<string>('posts/saveEditorToCache');
export const deleteEditorTextFromCache = createAction('posts/deleteEditorTextFromCache');
