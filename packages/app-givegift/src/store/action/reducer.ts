import { AnyAction } from 'redux'
import { InitialState } from './state'

/**
 * Initial data.
 */
const initialState: InitialState = {
  type: null,
  payload: null,
  meta: null,
  error: false,
  count: 0,
}

export const actionReducer = (
  state = initialState,
  action: AnyAction
): InitialState => {
  return {
    ...state,
    type: action.type,
    payload: action.payload,
    meta: action.meta,
    error: action.error,
    count: state.count + 1
  }
}