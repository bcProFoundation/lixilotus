import { createSelector } from 'reselect';

import { RootState } from '../store';

import { LoadingState } from './state';

export const getIsGlobalLoading = createSelector(
  (state: RootState) => state.loading,
  (state: LoadingState) => state.global
);
