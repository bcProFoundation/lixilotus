import * as _ from 'lodash';

import { Lixi } from '@bcpros/lixi-models/lib/lixi';
import { ClaimType } from '@bcpros/lixi-models';
import { createEntityAdapter, createReducer, Update } from '@reduxjs/toolkit';

import {
  importAccountSuccess, refreshLixiListSuccess, selectAccountSuccess
} from '../account/actions';
import {
  lockLixiSuccess, refreshLixiSuccess, selectLixiSuccess, setLixi, setLixiBalance,
  unlockLixiSuccess
} from './actions';
import { LixiesState } from './state';

export const lixiesAdapter = createEntityAdapter<Lixi>({});

const initialState: LixiesState = lixiesAdapter.getInitialState({
  selectedId: 0,
  claimIdsById: {},
});

export const lixiReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setLixi, (state, action) => {
      const lixies: any = action.payload;
      lixiesAdapter.upsertOne(state, lixies.lixi as Lixi);
      state.selectedId = lixies.lixi.id ?? undefined;
      if (lixies.lixi.claimType == ClaimType.OneTime) {
        lixies.subLixies.map((item: Lixi) => lixiesAdapter.upsertOne(state, item));
      }
    })
    .addCase(selectLixiSuccess, (state, action) => {
      const { lixi, children, claims } = action.payload;
      const id = lixi.id;
      state.selectedId = id;
      const updateLixi: Update<Lixi> = {
        id: lixi.id,
        changes: {
          ...lixi,
        },
      };
      lixiesAdapter.updateOne(state, updateLixi);

      for (let i = 0; i < _.size(children); i++) {
        const child = children[i];
        const updatechild: Update<Lixi> = {
          id: child.id,
          changes: {
            ...child,
          },
        };
        lixiesAdapter.updateOne(state, updatechild);
      }

      const claimIds = claims.map(claim => claim.id);
      state.claimIdsById[id] = claimIds;
    })
    .addCase(refreshLixiSuccess, (state, action) => {
      const { lixi, children, claims } = action.payload;
      const updateLixi: Update<Lixi> = {
        id: lixi.id,
        changes: {
          ...lixi,
        },
      };
      lixiesAdapter.updateOne(state, updateLixi);

      for (let i = 0; i < _.size(children); i++) {
        const child = children[i];
        const updatechild: Update<Lixi> = {
          id: child.id,
          changes: {
            ...child,
          },
        };
        lixiesAdapter.updateOne(state, updatechild);
      }

      const claimIds = action.payload.claims.map((claim) => claim.id);
      state.claimIdsById[lixi.id] = claimIds;
    })
    .addCase(selectAccountSuccess, (state, action) => {
      const { lixies } = action.payload;
      const lixiIds = lixies.map((lixi) => lixi.id);
      lixiesAdapter.upsertMany(state, lixies);
      if (lixiIds.length == 0 || !lixiIds.includes(state.selectedId)) {
        // The current selected lixi is not the same anymore
        // Reset the selected lixi
        state.selectedId = 0;
      }
    })
    .addCase(refreshLixiListSuccess, (state, action) => {
      const { lixies } = action.payload;
      const lixiIds = lixies.map((lixi) => lixi.id);
      lixiesAdapter.upsertMany(state, lixies);
      if (lixiIds.length == 0 || !lixiIds.includes(state.selectedId as number)) {
        // The current selected lixi is not the same anymore
        // Reset the selected lixi
        state.selectedId = 0;
      }
    })
    .addCase(importAccountSuccess, (state, action) => {
      const { lixies } = action.payload;
      const lixiIds = lixies.map((lixi) => lixi.id);
      lixiesAdapter.upsertMany(state, lixies);
      if (lixiIds.length == 0 || !lixiIds.includes(state.selectedId as number)) {
        // The current selected lixi is not the same anymore
        // Reset the selected lixi
        state.selectedId = 0;
      }
    })
    .addCase(lockLixiSuccess, (state, action) => {
      const lixi = action.payload;
      const updateLixi: Update<Lixi> = {
        id: lixi.id,
        changes: {
          status: lixi.status,
        },
      };
      lixiesAdapter.updateOne(state, updateLixi);
    })
    .addCase(unlockLixiSuccess, (state, action) => {
      const lixi = action.payload;
      const updateLixi: Update<Lixi> = {
        id: lixi.id,
        changes: {
          status: lixi.status,
        },
      };
      lixiesAdapter.updateOne(state, updateLixi);
    })
    .addCase(setLixiBalance, (state, action) => {
      const selectedId = state.selectedId;
      if (selectedId) {
        const updateLixi: Update<Lixi> = {
          id: selectedId,
          changes: {
            balance: action.payload,
          },
        };
        lixiesAdapter.updateOne(state, updateLixi);
      }
    });
});
