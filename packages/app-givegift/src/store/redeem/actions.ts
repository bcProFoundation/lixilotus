import { createAction } from '@reduxjs/toolkit';
import { CreateRedeemDto, Redeem } from '@abcpros/givegift-models/lib/redeem';

export const postRedeem = createAction<CreateRedeemDto>('redeem/postRedeem');
export const postRedeemSuccess = createAction<Redeem>('redeem/postRedeemSuccess');
export const postRedeemFailure = createAction('redeem/postRedeemFailure', (message: string) => {
  return {
    payload: message,
    error: true
  };
});
