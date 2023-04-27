import { AnyAction } from 'redux';

import { ErrorState } from './state';

const initialState: ErrorState = {
  error: null
};

export const errorReducer = (state = initialState, action: AnyAction): ErrorState => {
  const { error, payload } = action;
  if (error === true) {
    return {
      error: payload
    };
  }
  return state;
};
