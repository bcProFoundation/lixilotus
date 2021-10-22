import { configureStore, ThunkAction, Action, combineReducers } from "@reduxjs/toolkit";
import createSagaMiddleware from "@redux-saga/core";
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
    return getDefaultMiddleware().concat(sagaMiddleware, routerMiddleware(history))
  },
  devTools: process.env.NODE_ENV === 'production' ? false : true,
});

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