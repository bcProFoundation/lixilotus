import { configureStore, ThunkAction, Action, Store, AnyAction, combineReducers } from '@reduxjs/toolkit';
import createSagaMiddleware, { Task } from '@redux-saga/core';
import { createContext } from 'react';
import {
  PersistConfig,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import rootSaga from './rootSaga';
import useXPI from '@hooks/useXPI';
import useWallet from '@hooks/useWallet';
import rootReducer, { serverReducer } from './rootReducer';
import BCHJS from '@abcpros/xpi-js';
import { createRouterMiddleware, initialRouterState, routerReducer } from 'connected-next-router';
import { Context, createWrapper, HYDRATE } from 'next-redux-wrapper';
import { Router } from 'next/router';

export interface SagaStore extends Store {
  __sagaTask: Task;
};


const { getXPI } = useXPI();
export const XPI: BCHJS = getXPI(0);
export const Wallet = useWallet(XPI);

export const AppContext = createContext({ XPI, Wallet });

const makeStore = (context: Context) => {

  const isServer = typeof window === 'undefined';

  const sagaMiddleware = createSagaMiddleware({
    context: {
      XPI,
      Wallet
    },
    onError: (error: Error, { sagaStack: string }) => {
      console.log(error);
    }
  });

  const routerMiddleware = createRouterMiddleware();
  const { asPath } = (context as any).ctx || (Router as any).router || {};
  let initialState;
  if (asPath) {
    initialState = {
      router: initialRouterState(asPath)
    }
  }

  let store;

  if (isServer) {
    store = configureStore({
      reducer: serverReducer,
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware),
      devTools: false,
    });
  } else {
    store = configureStore({
      reducer: rootReducer,
      middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
          },
        }).concat(sagaMiddleware, routerMiddleware)
      },
      devTools: process.env.NODE_ENV === 'production' ? false : {
        actionsBlacklist: [
          'lixi/setLixiBalance',
          'account/setAccountBalance'
        ]
      },
      preloadedState: initialState
    });

    (store as any).__persistor = persistStore(store);

  }
  (store as SagaStore).__sagaTask = sagaMiddleware.run(rootSaga);
  return store;
}

// Define utilities types for redux toolkit
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;


export const wrapper = createWrapper<AppStore>(makeStore, { debug: true });