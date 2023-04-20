import { PersistState } from 'redux-persist';
import { createSelector } from 'reselect';

import { RootState } from '../store';

export const getIsBootstrapped = createSelector(
  (state: RootState) => state._persist,
  (state: PersistState) => (state && state.rehydrated ? state.rehydrated : false)
);
