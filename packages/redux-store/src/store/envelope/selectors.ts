import { createSelector } from 'reselect';

import { RootState } from '../store';

import { envelopesAdapter } from './reducer';
import { EnvelopesState } from './state';

const { selectAll, selectEntities, selectIds, selectTotal } = envelopesAdapter.getSelectors();

export const getAllEnvelopes = createSelector((state: RootState) => state.envelopes, selectAll);

export const getAllEnvelopesEntities = createSelector((state: RootState) => state.envelopes, selectEntities);

export const getSelectedEnvelopeId = createSelector(
  (state: RootState) => state.envelopes,
  (envelopes: EnvelopesState) => envelopes.selectedId
);

export const getSelectedEnvelope = createSelector(
  (state: RootState) => state.envelopes,
  (envelopes: EnvelopesState) => (envelopes.selectedId ? envelopes.entities[envelopes.selectedId] : undefined)
);
