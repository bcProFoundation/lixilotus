import BCHJS from '@bcpros/xpi-js';
import useWallet from '@hooks/useWallet';
import { WalletPathAddressInfo } from '@store/wallet';
import { ChronikClient } from 'chronik-client';
import { createContext } from 'react';

export type WalletContextValue = {
  XPI: BCHJS;
  chronik: ChronikClient,
  getWalletPathDetails: (mnemonic: string, paths: string[]) => Promise<WalletPathAddressInfo[]>;
  validateMnemonic: (mnemonic: string) => boolean;
};

export const WalletContext = createContext<WalletContextValue | null>(null);

export const WalletProvider = ({ children }) => {
  const Wallet = useWallet();

  return <WalletContext.Provider value={Wallet}>{children}</WalletContext.Provider>;
};
