import React, { createContext } from 'react';
import useVault from '@hooks/useVault';

export interface StoreCotextProps {
  createVault: Function
};

export const StoreContext = createContext({} as StoreCotextProps);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const vault = useVault();
  return (
    <StoreContext.Provider value={vault}>
      {children}
    </StoreContext.Provider>
  );
};
