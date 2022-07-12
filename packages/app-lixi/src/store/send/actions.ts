import { createAction } from '@reduxjs/toolkit';

export const sendXPISuccess = createAction<number>('send/sendXPISuccess');
export const sendXPIFailure = createAction<string>('send/sendXPIFailure');
