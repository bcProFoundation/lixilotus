import { createEntityAdapter, createReducer } from '@reduxjs/toolkit';
import { activateWalletSuccess, setWalletHasUpdated, setWalletRefreshInterval, writeWalletStatus } from './actions';
import { WalletPathAddressInfo } from './models';
import { WalletState } from './state';

export const walletAdapter = createEntityAdapter<WalletPathAddressInfo>({
  selectId: wallet => wallet.path
});

const initialState: WalletState = walletAdapter.getInitialState({
  selectedWalletPath: null,
  walletStatus: null,
  mnemonic: '',
  walletRefreshInterval: 5000,
  walletHasUpdated: false
});

export const walletStateReducer = createReducer(initialState, builder => {
  builder
    .addCase(writeWalletStatus, (state, action) => {
      state.walletStatus = action.payload;
    })
    .addCase(activateWalletSuccess, (state, action) => {
      const { walletPaths, mnemonic } = action.payload;
      walletAdapter.setAll(state, walletPaths);
      state.mnemonic = mnemonic;
    })
    .addCase(setWalletRefreshInterval, (state, action) => {
      state.walletRefreshInterval = action.payload;
    })
    .addCase(setWalletHasUpdated, (state, action) => {
      state.walletHasUpdated = action.payload;
    });
});
