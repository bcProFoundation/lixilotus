import { createAction } from '@reduxjs/toolkit';

export const subscribe = createAction('webpush/subscribe');
export const unsubscribe = createAction('webpush/unsubscribe');
