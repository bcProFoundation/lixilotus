import { createAction } from '@reduxjs/toolkit';
import { WalletPathAddressInfo, WalletStatus } from './models';

export const writeWalletStatus = createAction<WalletStatus>('wallet/writeWalletStatus');
export const activateWallet = createAction<string>('wallet/activateWallet');
export const activateWalletSuccess = createAction<{ walletPaths: WalletPathAddressInfo[]; mnemonic: string, selectPath: string }>(
  'wallet/activateWalletSuccess'
);
export const activateWalletFailure = createAction<string>('wallet/activateWalletFailure');
export const setWalletRefreshInterval = createAction<number>('wallet/setWalletRefreshInterval');
export const setWalletHasUpdated = createAction<boolean>('wallet/setWalletHasUpdated');
