import { Utxo } from "chronik-client";

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
    totalBalance: string;
    totalBalanceInSatoshis: string;
  };
  parsedTxHistory: any[];
  slpBalancesAndUtxos: {
    nonSlpUtxos: Array<Utxo>;
  }
  utxos: Utxo[];
}
