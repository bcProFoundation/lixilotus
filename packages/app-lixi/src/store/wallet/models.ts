import { ParsedChronikTx } from '@utils/chronik';
import { Tx, Utxo } from 'chronik-client';

export interface WalletPathAddressInfo {
  path: string;
  cashAddress: string;
  fundingAddress: string;
  fundingWif: string;
  hash160: string;
  legacyAddress: string;
  publicKey: string;
  xAddress: string;
}

export interface WalletStatus {
  balances: {
    totalBalance: string;
    totalBalanceInSatoshis: string;
  };
  parsedTxHistory: Array<Tx & { parsed: ParsedChronikTx }>;
  slpBalancesAndUtxos: {
    nonSlpUtxos: Array<Utxo & { address: string }>;
  };
  utxos: Array<Utxo & { address: string }>;
}
