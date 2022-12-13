type Nullable<T> = T | null;

declare module 'redux-saga/effects' {
  export * from '@redux-saga/core/effects';
  export function put<A extends ThunkAction>(action: A): PutEffect<A>;
}
