import { WalletContext, XPI, Wallet } from '@store/store';

export const WalletProvider = ({ children }) => {
  return <WalletContext.Provider value={{ XPI, Wallet }}>{children}</WalletContext.Provider>;
};
