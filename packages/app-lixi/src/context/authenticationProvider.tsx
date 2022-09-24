import { createContext } from 'react';
import useWebAuthentication from '../hooks/useWebAuthentication';

export const AuthenticationContext = createContext({});

export const AuthenticationProvider = ({ children }) => {
  // useWebAuthentication returns null if Web Authn is not supported
  const authentication = useWebAuthentication();

  return (
    <AuthenticationContext.Provider value={authentication}>
    </AuthenticationContext.Provider>
  );
};
