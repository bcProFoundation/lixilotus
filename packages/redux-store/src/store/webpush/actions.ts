import { Account } from '@bcpros/lixi-models';
import { createAction } from '@reduxjs/toolkit';

export const subscribeSelectedAccount = createAction<{
  interactive: boolean;
  modifySetting: boolean;
  clientAppId: string;
}>('webpush/subscribeSelectedAccount');
export const subscribeSelectedAccountSuccess = createAction<{ interactive: boolean; modifySetting: boolean }>(
  'webpush/subscribeSelectedAccountSuccess'
);
export const subscribeSelectedAccountFailure = createAction<{
  interactive: boolean;
  modifySetting: boolean;
  message: string;
}>('webpush/subscribeSelectedAccountFailure');
export const unsubscribeAll = createAction<{
  interactive: boolean;
  modifySetting: boolean;
  clientAppId: string;
}>('webpush/unsubscribeAll');
export const unsubscribeAllSuccess = createAction<{ interactive: boolean; modifySetting: boolean }>(
  'webpush/unsubscribeAllSuccess'
);
export const unsubscribeAllFailure = createAction<{ interactive: boolean; modifySetting: boolean; message: string }>(
  'webpush/unsubscribeAllFailure'
);
export const unsubscribeByAddresses = createAction<{
  addresses: string[];
  clientAppId: string;
  modifySetting: boolean;
}>('webpush/unsubscribeByAddresses');
