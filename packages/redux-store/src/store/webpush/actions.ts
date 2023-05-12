import { WebpushSubscribeCommand, WebpushUnsubscribeCommand } from '@bcpros/lixi-models';
import { createAction } from '@reduxjs/toolkit';

export const subscribe = createAction<{ interactive: boolean; clientAppId: string }>('webpush/subscribe');
export const subscribeSuccess = createAction<{ interactive: boolean }>('webpush/subscribeSuccess');
export const subscribeFailure = createAction<{ interactive: boolean; message: string }>('webpush/subscribeFailure');
export const unsubscribe = createAction<{ interactive: boolean; addresses: string[]; clientAppId: string }>('webpush/unsubscribe');
export const unsubscribeSuccess = createAction<{ interactive: boolean }>('webpush/unsubscribeSuccess');
export const unsubscribeFailure = createAction<{ interactive: boolean; message: string }>('webpush/unsubscribeFailure');
