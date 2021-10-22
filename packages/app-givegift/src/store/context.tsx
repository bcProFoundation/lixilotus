import React, { createContext } from 'react';
import useVault from '@hooks/useVault';
import { Provider } from 'react-redux';
import { store } from './store';

export interface StoreCotextProps {
  createVault: Function
};

export const StoreContext = createContext({} as StoreCotextProps);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
};
