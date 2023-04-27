import { EntityState } from '@reduxjs/toolkit';

import { WalletPathAddressInfo, WalletStatus } from './models';
export interface WalletState extends EntityState<WalletPathAddressInfo> {
  selectedWalletPath?: Nullable<string>;
  walletStatus?: WalletStatus;
  mnemonic: string;
  walletRefreshInterval: number;
  walletHasUpdated: boolean;
}
