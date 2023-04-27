import { createSelector } from 'reselect';

import { RootState } from '../store';

import { WalletStatus } from './models';
import { walletAdapter } from './reducer';
import { WalletState } from './state';

const { selectAll, selectEntities, selectIds, selectTotal } = walletAdapter.getSelectors();

export const getWalletState = (state: RootState): WalletState => state.wallet;

export const getAllWalletPaths = createSelector(getWalletState, selectAll);

export const getAllWalletPathsEntities = createSelector(getWalletState, selectEntities);

export const getWalletPathAddressInfoByPath = (path: string) =>
  createSelector(getAllWalletPathsEntities, paths => paths?.[path]);

export const getWalletStatus = createSelector(getWalletState, (state: WalletState) => state.walletStatus);

export const getWaletRefreshInterval = createSelector(
  getWalletState,
  (state: WalletState) => state.walletRefreshInterval
);

export const getWalletHasUpdated = createSelector(getWalletState, (state: WalletState) => state.walletHasUpdated);

export const getWalletBalances = createSelector(getWalletStatus, (state: WalletStatus) => state.balances);

export const getWalletParsedTxHistory = createSelector(getWalletStatus, (state: WalletStatus) => state.parsedTxHistory);

export const getSlpBalancesAndUtxos = createSelector(getWalletStatus, (state: WalletStatus) =>
  state && state.slpBalancesAndUtxos ? state.slpBalancesAndUtxos : null
);

export const getWalletUtxos = createSelector(getWalletStatus, (state: WalletStatus) =>
  state && state.utxos ? state.utxos : []
);

export const getWalletMnemonic = createSelector(getWalletState, (state: WalletState) => state.mnemonic);

export const getSelectedWalletPath = createSelector(getWalletState, (state: WalletState) =>
  state && state.selectedWalletPath ? state.entities[state.selectedWalletPath] : null
);
