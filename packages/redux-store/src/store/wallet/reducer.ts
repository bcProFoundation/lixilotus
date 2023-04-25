import { createEntityAdapter, createReducer } from '@reduxjs/toolkit';

import { activateWalletSuccess, setWalletHasUpdated, setWalletRefreshInterval, writeWalletStatus } from './actions';
import { WalletPathAddressInfo } from './models';
import { WalletState } from './state';

export const walletAdapter = createEntityAdapter<WalletPathAddressInfo>({
  selectId: wallet => wallet.path
});

const initialState: WalletState = walletAdapter.getInitialState({
  selectedWalletPath: null,
  walletStatus: {
    balances: {
      totalBalance: '0',
      totalBalanceInSatoshis: '0'
    },
    parsedTxHistory: [],
    slpBalancesAndUtxos: {
      nonSlpUtxos: []
    },
    utxos: []
  },
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
      const { walletPaths, mnemonic, selectPath } = action.payload;
      walletAdapter.setAll(state, walletPaths);
      state.mnemonic = mnemonic;
      state.walletHasUpdated = false;
      state.selectedWalletPath = selectPath;
    })
    .addCase(setWalletRefreshInterval, (state, action) => {
      state.walletRefreshInterval = action.payload;
    })
    .addCase(setWalletHasUpdated, (state, action) => {
      state.walletHasUpdated = action.payload;
    });
});
