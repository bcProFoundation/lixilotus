import { NotificationDto } from '@bcpros/lixi-models/lib/common/notification';
import { createEntityAdapter, createReducer, Update } from '@reduxjs/toolkit';
import {
  channelOff,
  channelOn,
  // receiveNotification,
  serverOff,
  serverOn
} from './actions';
import { WorshipState } from './state';

export const worshipAdapter = createEntityAdapter<any>({});

const initialState: WorshipState = worshipAdapter.getInitialState({
  channelStatusOn: false,
  serverStatusOn: false
});

export const worshipReducer = createReducer(initialState, builder => {
  builder
    .addCase(channelOff, (state, action) => {
      state.channelStatusOn = false;
    })
    .addCase(channelOn, (state, action) => {
      state.channelStatusOn = true;
    })
    .addCase(serverOff, (state, action) => {
      state.serverStatusOn = false;
    })
    .addCase(serverOn, (state, action) => {
      state.serverStatusOn = true;
    });
});
