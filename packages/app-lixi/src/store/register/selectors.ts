import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@store/store';
import { RegisterState } from './state';

export const getCurrentClaimCodeRegister = createSelector(
  (state: RootState) => state.claims,
  (state: RegisterState) => state.currentClaimCodeRegister
);
