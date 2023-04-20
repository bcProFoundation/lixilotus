import { Claim } from '@bcpros/lixi-models/lib/claim';
import { createEntityAdapter, createReducer } from '@reduxjs/toolkit';

import { refreshLixiSuccess, selectLixiSuccess } from '../lixi/actions';

import { saveClaimAddress, saveClaimCode, viewClaimFailure, viewClaimSuccess } from './actions';
import { ClaimsState } from './state';

export const claimsAdapter = createEntityAdapter<Claim>({});

const initialState: ClaimsState = claimsAdapter.getInitialState({
  currentAddress: '',
  currentClaimCode: '',
  currentLixiClaim: null
});

export const claimReducer = createReducer(initialState, builder => {
  builder
    .addCase(refreshLixiSuccess, (state, action) => {
      const claims = action.payload.claims;
      claimsAdapter.setAll(state, claims);
    })
    .addCase(selectLixiSuccess, (state, action) => {
      const claims = action.payload.claims;
      claimsAdapter.setAll(state, claims);
    })
    .addCase(saveClaimAddress, (state, action) => {
      state.currentAddress = action.payload;
    })
    .addCase(saveClaimCode, (state, action) => {
      state.currentClaimCode = action.payload;
    })
    .addCase(viewClaimSuccess, (state, action) => {
      state.currentLixiClaim = action.payload;
    })
    .addCase(viewClaimFailure, (state, action) => {
      state.currentLixiClaim = null;
    });
});
