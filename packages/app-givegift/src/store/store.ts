import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";


import createSagaMiddleware from "@redux-saga/core";
import rootReducer from "./rootReducer";
import rootSaga from "./rootSaga";
import useXPI from "@hooks/useXPI";

const { getXPI } = useXPI();
const XPI = getXPI();

const sagaMiddleware = createSagaMiddleware({
  context: {
    XPI
  },
  onError: (error: Error, { sagaStack: string }) => {
    console.log(error);
  }
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware),
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