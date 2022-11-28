import { BurnCommand } from '@bcpros/lixi-models';
import { createAction } from '@reduxjs/toolkit';

export const burnForUpDownVote = createAction<BurnCommand>('post/burnForUpDownVote');
export const burnForUpDownVoteSuccess = createAction<any>('post/burnForUpDownVoteSuccess');
export const burnForUpDownVoteFailure = createAction<string>('post/burnForUpDownVoteFailure');