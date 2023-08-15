import { createAction } from '@reduxjs/toolkit';

export const startChannel = createAction('message/startChannel');
export const stopChannel = createAction('message/stopChannel');
export const channelOn = createAction('message/channelOn');
export const channelOff = createAction('message/channelOff');
export const serverOn = createAction('message/serverOn');
export const serverOff = createAction('message/serverOff');
export const receiveLiveMessage = createAction('message/receiveLiveMessage');
export const userSubcribeToPageMessageSession = createAction<string>('message/userSubcribeToPageMessageSession');
export const userSubcribeToMultiPageMessageSession = createAction<number>(
  'message/userSubcribeToMultiPageMessageSession'
);
export const userSubcribeToAddressChannel = createAction<string>('message/userSubcribeToAddressChannel');
