import { LocalUserAccount, RenameAccountCommand, Lixi, ChangeAccountLocaleCommand } from '@bcpros/lixi-models';
import { createAction } from '@reduxjs/toolkit';
import { LocalUser } from 'src/models/localUser';

export const generateLocalUserAccount = createAction('localUserAccount/generateLocalUserAccount');
export const setLocalUserAccount = createAction<LocalUserAccount>('localUserAccount/setLocalUserAccount');
export const selectLocalUserAccount = createAction<number>('localUserAccount/selectLocalUserAccount');
export const importLocalUserAccount = createAction<string>('localUserAccount/importLocalUserAccount');
export const renameLocalUserAccount = createAction<RenameAccountCommand>('localUserAccount/renameLocalUserAccount');
export const renameLocalUserAccountSuccess = createAction<LocalUserAccount>(
  'localUserAccount/renameLocalUserAccountSuccess'
);
export const renameLocalUserAccountFailure = createAction<string>('localUserAccount/renameLocalUserAccountFailure');
export const changeLocalUserAccountLocale = createAction<ChangeAccountLocaleCommand>(
  'localUserAccount/changeLocalUserAccountLocale'
);
export const changeLocalUserAccountLocaleSuccess = createAction<LocalUserAccount>(
  'localUserAccount/changeLocalUserAccountLocaleSuccess'
);
export const changeLocalUserAccountLocaleFailure = createAction<string>(
  'localUserAccount/changeLocalUserAccountLocaleFailure'
);
export const silentLocalLogin = createAction<LocalUser>('localUserAccount/silentLocalLogin');
export const silentLocalLoginSuccess = createAction<LocalUser>('localUserAccount/silentLocalLoginSuccess');
export const silentLocalLoginFailure = createAction<string>('localUserAccount/silentLocalLoginFailure');
