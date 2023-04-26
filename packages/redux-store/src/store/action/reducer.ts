import { AnyAction } from 'redux';

import { ActionState } from './state';

/**
 * Initial data.
 */
const initialState: ActionState = {
  type: null,
  payload: null,
  meta: null,
  error: false,
  count: 0
};

export const actionReducer = (state = initialState, action: AnyAction): ActionState => {
  return {
    ...state,
    type: action.type,
    payload: action.payload ?? null,
    meta: action.meta ?? null,
    error: action.error ?? null,
    count: state.count + 1
  };
};
