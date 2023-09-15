import { AnalyticEvent } from '@bcpros/lixi-models';
import { createAction } from '@reduxjs/toolkit';

export const analyticEvent = createAction<AnalyticEvent>('analyticEvent/analyticEvent');

export const batchEvents = createAction<AnalyticEvent[]>('analyticEvent/batchEvents');

export const cancelBatch = createAction('analyticEvent/cancelBatch');
