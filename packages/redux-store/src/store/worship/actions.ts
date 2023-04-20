import { NotificationDto } from '@bcpros/lixi-models';
import { createAction } from '@reduxjs/toolkit';

export const startChannel = createAction('worship/startChannel');
export const stopChannel = createAction('worship/stopChannel');
export const channelOn = createAction('worship/channelOn');
export const channelOff = createAction('worship/channelOff');
export const serverOn = createAction('worship/serverOn');
export const serverOff = createAction('worship/serverOff');
export const receiveLiveWorship = createAction('worship/receiveLiveWorship');
