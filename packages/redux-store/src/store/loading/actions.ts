import { createAction } from '@reduxjs/toolkit';

export const showLoading = createAction<string>('loading/show');
export const hideLoading = createAction<string>('loading/hide');
