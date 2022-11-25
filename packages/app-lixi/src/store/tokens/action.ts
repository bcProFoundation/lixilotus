import { createAction } from '@reduxjs/toolkit';

export const fetchAllTokens = createAction('tokens/fetchAllToken');
export const fetchAllTokensSuccess = createAction<any>('tokens/fetchAllTokensSuccess');
export const fetchAllTokensFailure = createAction<any>('tokens/fetchAllTokensFailure');
export const postToken = createAction<any>('tokens/postToken');
export const postTokenSuccess = createAction<any>('tokens/postTokenSuccess');
export const postTokenFailure = createAction<string>('tokens/postTokenFailure');
export const getToken = createAction<string>('tokens/getToken');
export const getTokenSuccess = createAction<any>('tokens/getTokenSuccess');
export const getTokenFailure = createAction<string>('tokens/getTokenFailure');
export const setSelectedTokenId = createAction<any>('tokens/setSelectedTokenId');
