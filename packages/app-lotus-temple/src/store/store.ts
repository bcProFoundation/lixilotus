import createSagaMiddleware, { Task } from '@redux-saga/core';
import { Action, configureStore, Store, ThunkAction } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/dist/query';
import { createRouterMiddleware, initialRouterState } from 'connected-next-router';
import { Context, createWrapper } from 'next-redux-wrapper';
import { Router } from 'next/router';
import { FLUSH, PAUSE, PERSIST, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import { api as commentsApi } from './comment/comments.api';
import { api as pagesApi } from './page/pages.api';
import { api as postApi } from './post/posts.api';
import { api as worshipedPersonApi } from './worship/worshipedPerson.api';
import rootReducer, { serverReducer } from './rootReducer';
import rootSaga from './rootSaga';
import { WalletContext } from '@context/walletProvider';
import useXPI from '@hooks/useXPI';

export interface SagaStore extends Store {
  __sagaTask: Task;
}

const makeStore = (context: Context) => {
  const isServer = typeof window === 'undefined';

  const sagaMiddleware = createSagaMiddleware({
    onError: (error: Error, { sagaStack: string }) => {
      console.log(error);
    },
    context: {
      useXPI: useXPI
    }
  });

  const routerMiddleware = createRouterMiddleware();
  const { asPath } = (context as any).ctx || (Router as any).router || {};
  let initialState;
  if (asPath) {
    initialState = {
      router: initialRouterState(asPath)
    };
  }

  let store;

  if (isServer) {
    store = configureStore({
      reducer: serverReducer,
      middleware: getDefaultMiddleware => getDefaultMiddleware().concat(sagaMiddleware),
      devTools: false
    });
  } else {
    store = configureStore({
      reducer: rootReducer,
      middleware: getDefaultMiddleware => {
        return getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
          }
        })
          .concat(pagesApi.middleware)
          .concat(postApi.middleware)
          .concat(commentsApi.middleware)
          .concat(worshipedPersonApi.middleware)
          .concat(sagaMiddleware, routerMiddleware);
      },
      devTools:
        process.env.NODE_ENV === 'production'
          ? false
          : {
              actionsDenylist: ['wallet/writeWalletStatus']
            },
      preloadedState: initialState
    });
    setupListeners(store.dispatch);

    (store as any).__persistor = persistStore(store);
  }
  (store as SagaStore).__sagaTask = sagaMiddleware.run(rootSaga);
  return store;
};

// Define utilities types for redux toolkit
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;

export const wrapper = createWrapper<AppStore>(makeStore, { debug: true });
