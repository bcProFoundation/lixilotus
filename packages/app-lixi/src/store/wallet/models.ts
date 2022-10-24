export interface WalletAddressInfo {
  cashAddress: string;
  fundingAddress: string;
  fundingWif: string;
  hash160: string;
  legacyAddress: string;
  publicKey: string;
  xAddress: string;
  keyPair: any;
}

export interface WalletStatus {
  balances: {
    totalBalance: number;
    totalBalanceInSatoshis: number;
  };
  parsedTxHistory: any[];
  utxos: any[];
  name: string;
}
