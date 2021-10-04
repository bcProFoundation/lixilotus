import React, { createContext } from 'react';

type IAppContextProps = {
}

type AppProviderProps = {
  children: React.ReactNode
};

export const AppContext: React.Context<IAppContextProps> = createContext({} as IAppContextProps);

export const AppProvider = (props: AppProviderProps) => {
  return (
    <AppContext.Provider value={{}}>
      {props.children}
    </AppContext.Provider>
  );
};
