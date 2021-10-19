import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";


import createSagaMiddleware from "@redux-saga/core";
import rootReducer from "./rootReducer";
import rootSaga from "./rootSaga";


const sagaMiddleware = createSagaMiddleware();
// const middleware = [...getDefaultMiddleware({ thunk: false }), sagaMiddleware];


export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware),
  devTools: process.env.NODE_ENV === 'production' ? false : true,
});

sagaMiddleware.run(rootSaga);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
