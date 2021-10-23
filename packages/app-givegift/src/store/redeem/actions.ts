import { call } from '@redux-saga/core/effects';
import { createAction, PayloadAction } from '@reduxjs/toolkit';
import { Redeem } from '@abcpros/givegift-models/lib/redeem';



export const postRedeem = createAction<Redeem>('redeem/postRedeem');
export const postRedeemSuccess = createAction<Redeem>('redeem/postRedeemSuccess');
export const postRedeemFailure = createAction<string>('redeem/postRedeemFailure');
