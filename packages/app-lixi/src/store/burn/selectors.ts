import _ from 'lodash';
import { createSelector } from 'reselect';

import { RootState } from '../store';
import { BurnState } from './state';

export const getLatestBurnForPost = createSelector(
  (state: RootState) => state.burn,
  (burnState: BurnState) => burnState.latestBurnForPost
);

export const getLatestBurnForPage = createSelector(
  (state: RootState) => state.burn,
  (burnState: BurnState) => burnState.latestBurnForPage
);

export const getLatestBurnForToken = createSelector(
  (state: RootState) => state.burn,
  (burnState: BurnState) => burnState.latestBurnForToken
);
