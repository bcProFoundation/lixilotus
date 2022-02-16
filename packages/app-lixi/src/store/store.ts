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
import rootReducer from './rootReducer';
import BCHJS from '@abcpros/xpi-js';
// import { createRouterMiddleware, initialRouterState, routerReducer } from 'connected-next-router';
import { Context, createWrapper, HYDRATE } from 'next-redux-wrapper';

export interface SagaStore extends Store {
  __sagaTask: Task;
};


const { getXPI } = useXPI();
export const XPI: BCHJS = getXPI(0);
export const Wallet = useWallet(XPI);

export const AppContext = createContext({ XPI, Wallet });

const makeStore = (context: Context) => {

  const isServer = typeof window === 'undefined';
  console.log('isServer', isServer);

  const sagaMiddleware = createSagaMiddleware({
    context: {
      XPI,
      Wallet
    },
    onError: (error: Error, { sagaStack: string }) => {
      console.log(error);
    }
  });

  // const routerMiddleware = createRouterMiddleware();

  let store;

  // const newReducer = (state: RootState, action: AnyAction) => {
  //   if (action.type === HYDRATE) {
  //     const nextState = {
  //       ...state, // use previous state
  //       ...action.payload, // apply delta from hydration
  //     };
  //     return nextState;
  //   } else {
  //     return rootReducer(state, action);
  //   }
  // }

  if (isServer) {
    store = configureStore({
      reducer: rootReducer,
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware),
      devTools: false,
      // preloadedState: initialState
    });

    console.log('store', store);

  } else {
    store = configureStore({
      reducer: rootReducer,
      middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
          },
        }).concat(sagaMiddleware)
        //.concat(sagaMiddleware, routerMiddleware)
      },
      devTools: process.env.NODE_ENV === 'production' ? false : {
        actionsBlacklist: [
          'vault/setVaultBalance',
          'account/setAccountBalance'
        ]
      },
    });

    // (store as any).__persistor = persistStore(store);

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


export const wrapper = createWrapper<AppStore>(makeStore, { debug: process.env.NODE_ENV !== 'production' });