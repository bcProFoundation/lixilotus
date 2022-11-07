import { WalletPathAddressInfo, WalletStatus } from './models';
import { EntityState } from '@reduxjs/toolkit';
export interface WalletState extends EntityState<WalletPathAddressInfo> {
  selectedWalletPath?: Nullable<string>;
  walletStatus?: WalletStatus;
  mnemonic: string;
  walletRefreshInterval: number;
  walletHasUpdated: boolean;
}
