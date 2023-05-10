import { WebpushSubscribeCommand, WebpushUnsubscribeCommand } from '@bcpros/lixi-models';
import { createAction } from '@reduxjs/toolkit';

export const subscribe = createAction<WebpushSubscribeCommand>('webpush/subscribe');
export const unsubscribe = createAction<WebpushUnsubscribeCommand>('webpush/unsubscribe');
