import {
  LocalUserAccount,
  RenameAccountCommand,
  Lixi,
  ChangeAccountLocaleCommand,
} from '@bcpros/lixi-models';
import { createAction } from '@reduxjs/toolkit';


export const generateLocalUserAccount = createAction('localUserAccount/generateLocalUserAccount');
export const setLocalUserAccount = createAction<LocalUserAccount>('localUserAccount/setLocalUserAccount');
export const setLocalUserAccountSuccess = createAction<LocalUserAccount>('localUserAccount/setLocalUserAccountSuccess');
export const selectLocalUserAccount = createAction<number>('localUserAccount/selectLocalUserAccount');
export const importLocalUserAccount = createAction<string>('localUserAccount/importLocalUserAccount');
export const importLocalUserAccountSuccess = createAction<{ account: LocalUserAccount; lixies: Lixi[] }>('localUserAccount/importLocalUserAccountSuccess');
export const importLocalUserAccountFailure = createAction<string>('localUserAccount/importLocalUserAccountFailure');
export const renameLocalUserAccount = createAction<RenameAccountCommand>('localUserAccount/renameLocalUserAccount');
export const renameLocalUserAccountSuccess = createAction<LocalUserAccount>('localUserAccount/renameLocalUserAccountSuccess');
export const renameLocalUserAccountFailure = createAction<string>('localUserAccount/renameLocalUserAccountFailure');
export const changeLocalUserAccountLocale = createAction<ChangeAccountLocaleCommand>('localUserAccount/changeLocalUserAccountLocale');
export const changeLocalUserAccountLocaleSuccess = createAction<LocalUserAccount>('localUserAccount/changeLocalUserAccountLocaleSuccess');
export const changeLocalUserAccountLocaleFailure = createAction<string>('localUserAccount/changeLocalUserAccountLocaleFailure');
// export const deleteLocalUserAccount = createAction<DeleteAccountCommand>('localUserAccount/deleteLocalUserAccount');
export const deleteLocalUserAccountSuccess = createAction<number>('localUserAccount/deleteLocalUserAccountSuccess');
export const deleteLocalUserAccountFailure = createAction<string>('localUserAccount/deleteLocalUserAccountFailure');
