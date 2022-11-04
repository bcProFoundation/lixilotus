import { Utxo } from 'chronik-client';

export interface WalletPathAddressInfo {
  path: string;
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
    totalBalance: string;
    totalBalanceInSatoshis: string;
  };
  parsedTxHistory: any[];
  slpBalancesAndUtxos: {
    nonSlpUtxos: Array<Utxo & { address: string }>;
  };
  utxos: Array<Utxo & { address: string }>;
}
