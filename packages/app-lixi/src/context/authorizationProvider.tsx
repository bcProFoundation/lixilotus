import { createContext } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => { };

export type AuthorizationValue = {
  authorized: boolean,
  userAccountId?: number;
  alert: () => void;
}

const defaultAuthorizationValue: AuthorizationValue = {
  authorized: false,
  alert: noop
}

export const AuthorizationContext = createContext<AuthorizationValue>(defaultAuthorizationValue);

export const AuthorizationProvider = ({ children }) => {
  // useWebAuthentication returns null if Web Authn is not supported
  // const authentication = useWebAuthentication();
  // const authentication = {} as any;

  return <AuthorizationContext.Provider value={defaultAuthorizationValue}>{children}</AuthorizationContext.Provider>;
};