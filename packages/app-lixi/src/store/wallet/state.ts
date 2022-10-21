import { WalletAddressInfo, WalletDetail } from './models';

export interface WalletState {
  walletDetail: WalletDetail;
  Path899: WalletAddressInfo;
  Path1899: WalletAddressInfo;
  Path10605: WalletAddressInfo;
  name: string;
  mnemonic: string;
}
