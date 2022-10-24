import { createReducer } from '@reduxjs/toolkit';
import { writeWalletStatus } from './actions';
import { WalletState } from './state';

const initialState: WalletState = {
  walletStatus: null,
  Path899: null,
  Path1899: null,
  Path10605: null,
  name: '',
  mnemonic: ''
};

export const walletStateReducer = createReducer(initialState, builder => {
  builder.addCase(writeWalletStatus, (state, action) => {
    state.walletStatus = action.payload;
  });
});
