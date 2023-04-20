import { createSelector } from 'reselect';

import { RootState } from '../store';

import { ActionState } from './state';

export const getAction = createSelector(
  (state: RootState) => state.action,
  (state: ActionState) => state
);
