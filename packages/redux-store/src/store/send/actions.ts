import { createAction } from '@reduxjs/toolkit';

export const sendXPISuccess = createAction<string>('send/sendXPISuccess');
export const sendXPIFailure = createAction<string>('send/sendXPIFailure');
