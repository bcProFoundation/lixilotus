import { BurnCommand, Burn } from '@bcpros/lixi-models';
import { createAction } from '@reduxjs/toolkit';

export const burnForUpDownVote = createAction<BurnCommand>('post/burnForUpDownVote');
export const burnForUpDownVoteSuccess = createAction<Burn>('post/burnForUpDownVoteSuccess');
export const burnForUpDownVoteFailure = createAction<string>('post/burnForUpDownVoteFailure');
export const burning = createAction<any>('post/burning');
export const doneBurning = createAction('post/doneBurning');
export const startBurnChannel = createAction('post/startBurnChannel');
export const addBurnToQueue = createAction('post/addBurnToQueue');
export const createTxHex = createAction<any>('post/createTxHex');
