import { BurnCommand, Burn, BurnQueueCommand } from '@bcpros/lixi-models';
import { createAction } from '@reduxjs/toolkit';

export const burnForUpDownVote = createAction<BurnCommand>('post/burnForUpDownVote');
export const burnForUpDownVoteSuccess = createAction<Burn>('post/burnForUpDownVoteSuccess');
export const burnForUpDownVoteFailure = createAction<string>('post/burnForUpDownVoteFailure');
export const addBurnTransaction = createAction<BurnQueueCommand>('post/addBurnTransaction');
export const createTxHex = createAction<any>('post/createTxHex');
export const returnTxHex = createAction<any>('post/returnTxHex');
export const addBurnQueue = createAction<any>('post/addBurnQueue');
export const removeBurnQueue = createAction('post/removeBurnQueue');
export const clearBurnQueue = createAction('post/clearBurnQueue');
export const addFailQueue = createAction<any>('post/addFailQueue');
export const removeFailQueue = createAction('post/removeFailQueue');
export const clearFailQueue = createAction('post/clearFailQueue');
export const moveAllBurnToFailQueue = createAction('post/moveAllBurnToFailQueue');
