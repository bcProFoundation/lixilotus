import { createAction } from '@reduxjs/toolkit';

export const wsConnect = createAction('ws/wsConnect');
export const wsDisconnect = createAction('ws/wsDisconnect');
export const connectToChannels = createAction('ws/connectToChannels');
