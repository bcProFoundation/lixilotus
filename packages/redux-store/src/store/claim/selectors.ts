import { createSelector } from 'reselect';

import { RootState } from '../store';

import { claimsAdapter } from './reducer';
import { ClaimsState } from './state';

const { selectAll, selectEntities, selectIds, selectTotal } = claimsAdapter.getSelectors();

export const getAllClaims = createSelector((state: RootState) => state.claims, selectAll);

export const getAllClaimsEntities = createSelector((state: RootState) => state.claims, selectEntities);

export const getCurrentAddress = createSelector(
  (state: RootState) => state.claims,
  (state: ClaimsState) => state.currentAddress
);

export const getCurrentClaimCode = createSelector(
  (state: RootState) => state.claims,
  (state: ClaimsState) => state.currentClaimCode
);
export const getCurrentLixiClaim = createSelector(
  (state: RootState) => state.claims,
  (state: ClaimsState) => state.currentLixiClaim
);
