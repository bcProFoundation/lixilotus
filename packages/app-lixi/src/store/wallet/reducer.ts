import { createReducer } from '@reduxjs/toolkit';
import { updateWalletState } from './actions';
import { WalletState } from './state';

const initialState: WalletState = {
  walletDetail: null,
  Path899: null,
  Path1899: null,
  Path10605: null,
  name: '',
  mnemonic: ''
};

export const walletStateReducer = createReducer(initialState, builder => {
  builder.addCase(updateWalletState, (state, action) => {
    state = action.payload;
  });
});
