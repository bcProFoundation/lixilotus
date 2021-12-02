import { createAction } from '@reduxjs/toolkit';
import { CreateRedeemDto, Redeem } from '@abcpros/givegift-models/lib/redeem';
import { RedeemsState } from './state';

export const postRedeemActionType = 'redeem/postRedeem';
export const postRedeem = createAction<CreateRedeemDto>('redeem/postRedeem');
export const postRedeemSuccess = createAction<Redeem>('redeem/postRedeemSuccess');
export const postRedeemFailure = createAction('redeem/postRedeemFailure', (message: string) => {
  return {
    payload: message,
    error: true
  };
});
export const saveRedeemAddress = createAction<string>('redeem/saveRedeemAddress');
export const saveRedeemCode = createAction<string>('redeem/saveRedeemCode');