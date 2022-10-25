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
    totalBalance: number;
    totalBalanceInSatoshis: number;
  };
  parsedTxHistory: any[];
  slpBalancesAndUtxos: {
    nonSlpUtxos: Array<Utxo>;
    slpUtxos: Array<any>
  }
  utxos: Utxo[];
  name: string;
}
