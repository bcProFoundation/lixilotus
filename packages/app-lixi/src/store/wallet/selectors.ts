import { useAppSelector } from '@store/hooks';
import { createSelector } from 'reselect';
import { RootState } from '../store';
import { WalletStatus } from './models';
import { WalletState } from './state';

export const getWalletState = (state: RootState): WalletState => state.wallet;

export const getWalletStatus = createSelector(
  (state: RootState) => state.wallet,
  (state: WalletState) => state.walletStatus
);

export const getWalletBalance = createSelector(getWalletStatus, (state: WalletStatus) => state.balances);

export const getWalletParsedTxHistory = createSelector(getWalletStatus, (state: WalletStatus) => state.parsedTxHistory);

export const getWalletUtxos = createSelector(getWalletStatus, (state: WalletStatus) => state.utxos);
