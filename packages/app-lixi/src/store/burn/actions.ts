import { BurnCommand, Burn } from '@bcpros/lixi-models';
import { createAction } from '@reduxjs/toolkit';

export const burnForUpDownVote = createAction<BurnCommand>('post/burnForUpDownVote');
export const burnForUpDownVoteSuccess = createAction<Burn>('post/burnForUpDownVoteSuccess');
export const burnForUpDownVoteFailure = createAction<string>('post/burnForUpDownVoteFailure');
export const addBurnTransaction = createAction('post/addBurnTransaction');
export const createTxHex = createAction<any>('post/createTxHex');
export const addBurnQueue = createAction<any>('post/addBurnQueue');
export const removeBurnQueue = createAction('post/removeBurnQueue');
export const removeAllBurnQueue = createAction('post/removeAllBurnQueue');
