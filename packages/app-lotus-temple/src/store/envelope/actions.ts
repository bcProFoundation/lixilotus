import { createAction } from '@reduxjs/toolkit';
import { Envelope } from '@bcpros/lixi-models';

export const getEnvelope = createAction<number>('envelope/getEnvelope');
export const getEnvelopeSuccess = createAction<Envelope>('envelope/getEnvelopeSuccess');
export const getEnvelopeFailure = createAction<string>('envelope/getEnvelopeFailure');

export const getEnvelopes = createAction('envelope/getEnvelopes');
export const getEnvelopesSuccess = createAction<Envelope[]>('envelope/getEnvelopesSuccess');
export const getEnvelopesFailure = createAction<string>('envelope/getEnvelopesFailure');
