import { createContext } from 'react';
import useWebAuthentication, { DeviceAuthenticationValue } from '../hooks/useDeviceAuthentication';

export const AuthenticationContext = createContext<DeviceAuthenticationValue | undefined>(undefined);

export const AuthenticationProvider = ({ children }) => {
  // useWebAuthentication returns null if Web Authn is not supported
  const authentication = useWebAuthentication();
  // const authentication = {} as any;

  return <AuthenticationContext.Provider value={authentication}>{children}</AuthenticationContext.Provider>;
};
