import _ from 'lodash';
import { createSelector } from 'reselect';

import { Lixi } from '@bcpros/lixi-models';

import { RootState } from '../store';
import { lixiesAdapter } from './reducer';
import { LixiesState } from './state';

const selectAccounts = (state: RootState) => state.accounts;

const selectSelectedAccount = createSelector(
  selectAccounts,
  (state) => state.selectedId
)

const {
  selectAll,
  selectEntities,
  selectIds,
  selectTotal
} = lixiesAdapter.getSelectors();


export const getAllLixies = createSelector(
  (state: RootState) => state.lixies,
  selectAll
);

export const getAllSubLixies = createSelector(
  (state: RootState) => state.lixies,
  selectAll
);

export const getAllLixiesEntities = createSelector(
  (state: RootState) => state.lixies,
  selectEntities
);

export const getSelectedLixiId = createSelector(
  (state: RootState) => state.lixies,
  (lixies: LixiesState) => lixies.selectedId as number
);

export const getLixiById = (id: number) => createSelector(
  selectEntities,
  (lixies) => lixies[id]
)

export const getLixiesBySelectedAccount = createSelector(
  [selectSelectedAccount, getAllLixies],
  (accountId, lixies) => lixies.filter(lixi => lixi.accountId === accountId && _.isNil(lixi.parentId))
)

export const getSelectedLixi = createSelector(
  [getLixiesBySelectedAccount, getSelectedLixiId],
  (lixies: Lixi[], selectedLixiId: number) => lixies.find(lixi => lixi.id === selectedLixiId)
)

export const getLixiesByLixiParent = (id: number) => createSelector(
  [getSelectedLixiId, getAllLixies],
  (lixiId, lixies) => lixies.filter(lixi => lixi.parentId === id)
)