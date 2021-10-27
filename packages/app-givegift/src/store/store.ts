import { configureStore, ThunkAction, Action, combineReducers } from "@reduxjs/toolkit";
import createSagaMiddleware from "@redux-saga/core";
import {
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import rootSaga from "./rootSaga";
import useXPI from "@hooks/useXPI";
import useWallet from "@hooks/useWallet";
import { routerMiddleware } from "connected-react-router";
import { history } from "@utils/history";
import rootReducer from "./rootReducer";


const { getXPI } = useXPI();
const XPI = getXPI();
const Wallet = useWallet(XPI);

const sagaMiddleware = createSagaMiddleware({
  context: {
    XPI,
    Wallet
  },
  onError: (error: Error, { sagaStack: string }) => {
    console.log(error);
  }
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(sagaMiddleware, routerMiddleware(history))
  },
  devTools: process.env.NODE_ENV === 'production' ? false : true,
});

export const persistor = persistStore(store);

sagaMiddleware.run(rootSaga);


// Define utilities types for redux toolkit
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;