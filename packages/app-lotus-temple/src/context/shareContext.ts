import { createCaller } from 'react-outside-call';
import { useContext } from 'react';
import { AuthenticationContext } from './authenticationProvider';
import { AuthorizationContext } from './authorizationProvider';
import { WalletContext } from './walletProvider';

export const callConfig = createCaller({
  authenticationContext: () => useContext(AuthenticationContext),
  authorizationContext: () => useContext(AuthorizationContext),
  walletContext: () => useContext(WalletContext)
});
