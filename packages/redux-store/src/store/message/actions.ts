import { createAction } from '@reduxjs/toolkit';
import { IPageMessageSessionState } from './state';

export const removePageMessageSession = createAction<string>('message/removePageMessageSession');
export const removeAllPageMessageSession = createAction('message/removeAllPageMessageSession');
export const upsertPageMessageSession = createAction<IPageMessageSessionState>('message/upsertPageMessageSession');
export const receiveLiveMessage = createAction('message/receiveLiveMessage');
export const userSubcribeToPageMessageSession = createAction<string>('message/userSubcribeToPageMessageSession');
export const userSubcribeToMultiPageMessageSession = createAction<number>(
  'message/userSubcribeToMultiPageMessageSession'
);
export const userSubcribeToAddressChannel = createAction<string>('message/userSubcribeToAddressChannel');
