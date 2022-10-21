export interface WalletAddressInfo {
  cashAddress: string;
  fundingAddress: string;
  fundingWif: string;
  hash160: string;
  legacyAddress: string;
  publicKey: string;
  xAddress: string;
}

export interface WalletDetail {
  balances: {
    totalBalance: number;
    totalBalanceInSatoshis: number;
  };
  parsedTxHistory: any[];
  utxos: any[];
  name: string;
  Path899: WalletAddressInfo;
  Path1899: WalletAddressInfo;
  Path10605: WalletAddressInfo;
}
