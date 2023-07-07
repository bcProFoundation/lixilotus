import { getSelectedAccount } from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { createContext, useCallback } from 'react';
import { shallowEqual } from 'react-redux';
import { openModal } from '@store/modal/actions';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => { };

export type AuthorizationValue = {
  authorized: boolean;
  anonymous: boolean;
  userAccountId?: number;
  alert: () => void;
};

const defaultAuthorizationValue: AuthorizationValue = {
  authorized: false,
  anonymous: true,
  alert: noop
};

export const AuthorizationContext = createContext<AuthorizationValue>(defaultAuthorizationValue);

export const AuthorizationProvider = ({ children }) => {
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(getSelectedAccount, shallowEqual);
  const authorized = selectedAccount ? true : false;
  const anonymous = !authorized;
  const userAccountId = selectedAccount && selectedAccount.id ? selectedAccount.id : undefined;

  const alert = useCallback(() => {
    // Alert not have permission here
    dispatch(openModal('AuthorizationModal', {}));
  }, []);

  return (
    <AuthorizationContext.Provider value={{ authorized, anonymous, userAccountId, alert }}>
      {children}
    </AuthorizationContext.Provider>
  );
};
