import { createAction } from '@reduxjs/toolkit';
import { CreateClaimDto, Claim, ViewClaimDto } from '@bcpros/lixi-models';

export const postClaimActionType = 'claim/postClaim';
export const postClaim = createAction<CreateClaimDto>('claim/postClaim');
export const postClaimSuccess = createAction<Claim>('claim/postClaimSuccess');
export const postClaimFailure = createAction('claim/postClaimFailure', (message: string) => {
  return {
    payload: message,
    error: true
  };
});
export const postRegister = createAction<number>('claim/postRegister');

export const saveClaimAddress = createAction<string>('claim/saveClaimAddress');
export const saveClaimCode = createAction<string>('claim/saveClaimCode');

export const viewClaim = createAction<number>('claim/viewClaim');
export const viewClaimSuccess = createAction<ViewClaimDto>('claim/viewClaimSuccess');
export const viewClaimFailure = createAction<string>('claim/viewClaimFailure');
