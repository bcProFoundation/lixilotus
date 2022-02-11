import { createAction } from '@reduxjs/toolkit';
import { CreateRedeemDto, Redeem, ViewRedeemDto } from '@bcpros/lixi-models';

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

export const viewRedeem = createAction<number>('redeem/viewRedeem');
export const viewRedeemSuccess = createAction<ViewRedeemDto>('redeem/viewRedeemSuccess');
export const viewRedeemFailure = createAction<string>('redeem/viewRedeemFailure');