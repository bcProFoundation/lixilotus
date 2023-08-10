import { useContext } from 'react';
import { createCaller } from 'react-outside-call';

import { AuthenticationContext } from './authenticationProvider';
import { AuthorizationContext } from './authorizationProvider';
import { WalletContext } from './walletProvider';
import { ServiceWorkerContext } from './serviceWorkerProvider';
import { SocketContext } from './socketContext';

export const callConfig = createCaller({
  serviceWorkerContext: () => useContext(ServiceWorkerContext),
  authenticationContext: () => useContext(AuthenticationContext),
  authorizationContext: () => useContext(AuthorizationContext),
  walletContext: () => useContext(WalletContext),
  socketContext: () => useContext(SocketContext)
});
