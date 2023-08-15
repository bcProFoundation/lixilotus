import { getSelectedAccount, silentLogin } from '@store/account';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { createContext, useEffect } from 'react';
import useWebAuthentication, { DeviceAuthenticationValue } from '../hooks/useDeviceAuthentication';
import { shallowEqual } from 'react-redux';

export const AuthenticationContext = createContext<DeviceAuthenticationValue | undefined>(undefined);

export const AuthenticationProvider = ({ children }) => {
  // useWebAuthentication returns null if Web Authn is not supported
  const authentication = useWebAuthentication();
  const selectedAccount = useAppSelector(getSelectedAccount, shallowEqual);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (selectedAccount) {
      dispatch(silentLogin(selectedAccount.mnemonic));
    }
  }, []);

  return <AuthenticationContext.Provider value={authentication}>{children}</AuthenticationContext.Provider>;
};
