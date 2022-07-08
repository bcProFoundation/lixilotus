import * as _ from 'lodash';

import { Lixi, ClaimType } from '@bcpros/lixi-models/lib/lixi';
import { createEntityAdapter, createReducer, isAnyOf, Update } from '@reduxjs/toolkit';

import {
  importAccountSuccess,
  refreshLixiListSilentSuccess,
  refreshLixiListSuccess,
  selectAccountSuccess
} from '../account/actions';
import {
  fetchInitialSubLixiesSuccess,
  fetchMoreSubLixiesSuccess,
  archiveLixiSuccess,
  postLixiSuccess,
  refreshLixiSuccess,
  renameLixiSuccess,
  selectLixiSuccess,
  setLixi,
  setLixiBalance,
  unarchiveLixiSuccess,
  refreshLixiSilentSuccess
} from './actions';
import { LixiesState } from './state';

export const lixiesAdapter = createEntityAdapter<Lixi>({});

export const childrenLixiesAdapter = createEntityAdapter<Lixi>({});

const initialState: LixiesState = lixiesAdapter.getInitialState({
  selectedId: 0,
  claimIdsById: {},
  subLixies: childrenLixiesAdapter.getInitialState({}),
  subLixiesCount: 0,
  currentSubLixiesStartId: 0,
  hasMoreSubLixies: false
});

export const lixiReducer = createReducer(initialState, builder => {
  builder
    .addCase(postLixiSuccess, (state, action) => {
      const lixi: any = action.payload;
      lixiesAdapter.upsertOne(state, lixi as Lixi);
    })
    .addCase(setLixi, (state, action) => {
      const lixi: any = action.payload;
      state.selectedId = lixi.id ?? undefined;
    })
    .addCase(selectLixiSuccess, (state, action) => {
      const { lixi, claims } = action.payload;
      const id = lixi.id;
      state.selectedId = id;
      const updateLixi: Update<Lixi> = {
        id: lixi.id,
        changes: {
          ...lixi
        }
      };
      lixiesAdapter.updateOne(state, updateLixi);

      const claimIds = claims.map(claim => claim.id);
      state.claimIdsById[id] = claimIds;
    })
    .addCase(selectAccountSuccess, (state, action) => {
      const { lixies } = action.payload;
      const lixiIds = lixies.map(lixi => lixi.id);
      lixiesAdapter.upsertMany(state, lixies);
      if (lixiIds.length == 0 || !lixiIds.includes(state.selectedId)) {
        // The current selected lixi is not the same anymore
        // Reset the selected lixi
        state.selectedId = 0;
      }
    })
    .addCase(importAccountSuccess, (state, action) => {
      const { lixies } = action.payload;
      const lixiIds = lixies.map(lixi => lixi.id);
      lixiesAdapter.upsertMany(state, lixies);
      if (lixiIds.length == 0 || !lixiIds.includes(state.selectedId as number)) {
        // The current selected lixi is not the same anymore
        // Reset the selected lixi
        state.selectedId = 0;
      }
    })
    .addCase(archiveLixiSuccess, (state, action) => {
      const lixi = action.payload;
      const updateLixi: Update<Lixi> = {
        id: lixi.id,
        changes: {
          status: lixi.status
        }
      };
      lixiesAdapter.updateOne(state, updateLixi);
    })
    .addCase(unarchiveLixiSuccess, (state, action) => {
      const lixi = action.payload;
      const updateLixi: Update<Lixi> = {
        id: lixi.id,
        changes: {
          status: lixi.status
        }
      };
      lixiesAdapter.updateOne(state, updateLixi);
    })
    .addCase(setLixiBalance, (state, action) => {
      const selectedId = state.selectedId;
      if (selectedId) {
        const updateLixi: Update<Lixi> = {
          id: selectedId,
          changes: {
            balance: action.payload
          }
        };
        lixiesAdapter.updateOne(state, updateLixi);
      }
    })
    .addCase(renameLixiSuccess, (state, action) => {
      const lixi = action.payload;
      const updateLixi: Update<Lixi> = {
        id: lixi.id,
        changes: {
          name: lixi.name
        }
      };
      lixiesAdapter.updateOne(state, updateLixi);
    })
    .addCase(fetchInitialSubLixiesSuccess, (state, action) => {
      const result = action.payload;
      childrenLixiesAdapter.setAll(state.subLixies, result.data ?? []);
      state.subLixiesCount = result.totalCount;
      state.currentSubLixiesStartId = _.toSafeInteger(result.pageInfo.endCursor);
      state.hasMoreSubLixies = result.pageInfo.hasNextPage;
    })
    .addCase(fetchMoreSubLixiesSuccess, (state, action) => {
      const result = action.payload;
      childrenLixiesAdapter.upsertMany(state.subLixies, result.data ?? []);
      state.subLixiesCount = result.totalCount;
      state.currentSubLixiesStartId = _.toSafeInteger(result.pageInfo.endCursor);
      state.hasMoreSubLixies = result.pageInfo.hasNextPage;
    })
    .addMatcher(isAnyOf(refreshLixiListSuccess, refreshLixiListSilentSuccess), (state, action) => {
      const { lixies } = action.payload;
      const lixiIds = lixies.map(lixi => lixi.id);
      lixiesAdapter.upsertMany(state, lixies);
      if (lixiIds.length == 0 || !lixiIds.includes(state.selectedId as number)) {
        // The current selected lixi is not the same anymore
        // Reset the selected lixi
        state.selectedId = 0;
      }
    })
    .addMatcher(isAnyOf(refreshLixiSuccess, refreshLixiSilentSuccess), (state, action) => {
      const { lixi, claims } = action.payload;
      const updateLixi: Update<Lixi> = {
        id: lixi.id,
        changes: {
          ...lixi
        }
      };
      lixiesAdapter.updateOne(state, updateLixi);

      const claimIds = claims.map(claim => claim.id);
      state.claimIdsById[lixi.id] = claimIds;
    });
});
