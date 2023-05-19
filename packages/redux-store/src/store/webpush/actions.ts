import { createAction } from '@reduxjs/toolkit';

export const subscribeSelectedAccount = createAction<{ interactive: boolean; clientAppId: string }>(
  'webpush/subscribeSelectedAccount'
);
export const subscribeSelectedAccountSuccess = createAction<{ interactive: boolean }>(
  'webpush/subscribeSelectedAccountSuccess'
);
export const subscribeSelectedAccountFailure = createAction<{ interactive: boolean; message: string }>(
  'webpush/subscribeSelectedAccountFailure'
);
export const unsubscribeAll = createAction<{ interactive: boolean; clientAppId: string }>('webpush/unsubscribeAll');
export const unsubscribeAllSuccess = createAction<{ interactive: boolean }>('webpush/unsubscribeAllSuccess');
export const unsubscribeAllFailure = createAction<{ interactive: boolean; message: string }>(
  'webpush/unsubscribeAllFailure'
);
export const unsubscribeByAddresses = createAction<{ addresses: string[]; clientAppId: string }>(
  'webpush/unsubscribeByAddresses'
);
