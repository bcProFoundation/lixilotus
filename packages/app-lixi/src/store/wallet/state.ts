import { WalletAddressInfo, WalletStatus } from './models';

export interface WalletState {
  walletStatus: WalletStatus;
  Path899: WalletAddressInfo;
  Path1899: WalletAddressInfo;
  Path10605: WalletAddressInfo;
  name: string;
  mnemonic: string;
}
