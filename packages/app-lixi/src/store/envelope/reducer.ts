import { Envelope } from '@bcpros/lixi-models';
import { createEntityAdapter, createReducer, Update } from '@reduxjs/toolkit';

import { importAccountSuccess, selectAccountSuccess } from '../account/actions';
import { getEnvelopesSuccess, getEnvelopeSuccess } from './actions';
import { EnvelopesState } from './state';

export const envelopesAdapter = createEntityAdapter<Envelope>({
})


const initialState: EnvelopesState = envelopesAdapter.getInitialState({
  selectedId: 0,
});

export const envelopeReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(getEnvelopeSuccess, (state, action) => {
      const envelope = action.payload;
      envelopesAdapter.upsertOne(state, envelope);
      state.selectedId = envelope.id ?? 0;
    })
    .addCase(getEnvelopesSuccess, (state, action) => {
      const envelopes = action.payload;
      envelopesAdapter.setAll(state, envelopes);
    })
})