import { useAppSelector } from '@store/hooks';
import { createSelector } from 'reselect';
import { RootState } from '../store';
import { WalletDetail } from './models';
import { WalletState } from './state';

export const getWalletState = useAppSelector((state: RootState) => state.wallet);

export const getWalletDetail = createSelector(
  (state: RootState) => state.wallet,
  (state: WalletState) => state.walletDetail
);

export const getWalletBalance = createSelector(getWalletDetail, (state: WalletDetail) => state.balances);

export const getWalletParsedTxHistory = createSelector(getWalletDetail, (state: WalletDetail) => state.parsedTxHistory);

export const getWalletUtxos = createSelector(getWalletDetail, (state: WalletDetail) => state.utxos);
