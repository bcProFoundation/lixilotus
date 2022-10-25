import BCHJS from '@bcpros/xpi-js';
import { createContext } from 'react';
import useWallet from '@hooks/useWallet';
import { WalletAddressInfo } from '@store/wallet';

export type WalletContextValue = {
  XPI: BCHJS;
  getWalletDetails: (string) => Promise<WalletAddressInfo>;
  validateMnemonic: (string) => boolean;
};

export const WalletContext = createContext<WalletContextValue | null>(null);

export const WalletProvider = ({ children }) => {
  const Wallet = useWallet();

  return <WalletContext.Provider value={Wallet}>{children}</WalletContext.Provider>;
};
