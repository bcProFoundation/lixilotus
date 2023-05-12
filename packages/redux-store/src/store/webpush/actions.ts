import { WebpushSubscribeCommand, WebpushUnsubscribeCommand } from '@bcpros/lixi-models';
import { createAction } from '@reduxjs/toolkit';

export const subscribeAll = createAction<{ interactive: boolean; clientAppId: string }>('webpush/subscribeAll');
export const subscribeAllSuccess = createAction<{ interactive: boolean }>('webpush/subscribeAllSuccess');
export const subscribeAllFailure = createAction<{ interactive: boolean; message: string }>(
  'webpush/subscribeAllFailure'
);
export const unsubscribeAll = createAction<{ interactive: boolean; clientAppId: string }>('webpush/unsubscribeAll');
export const unsubscribeAllSuccess = createAction<{ interactive: boolean }>('webpush/unsubscribeAllSuccess');
export const unsubscribeAllFailure = createAction<{ interactive: boolean; message: string }>(
  'webpush/unsubscribeAllFailure'
);
export const unsubscribeByAddresses = createAction<{ addresses: string[]; clientAppId: string }>(
  'webpush/unsubscribeByAddresses'
);
