import { BurnCommand, Burn } from '@bcpros/lixi-models';
import { createAction } from '@reduxjs/toolkit';

export const burnForUpDownVote = createAction<BurnCommand>('post/burnForUpDownVote');
export const burnForUpDownVoteSuccess = createAction<Burn>('post/burnForUpDownVoteSuccess');
export const burnForUpDownVoteFailure = createAction<string>('post/burnForUpDownVoteFailure');
export const updatePostBurnValue = createAction<BurnCommand>('post/updatePostBurnValue');
export const updateCommentBurnValue = createAction<BurnCommand>('post/updateCommentBurnValue');
