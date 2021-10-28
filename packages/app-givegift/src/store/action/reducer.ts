import { AnyAction } from 'redux'
import { InitialState } from './state'

/**
 * Initial data.
 */
const initialState: InitialState = {
  type: null,
  count: 0,
}

export const actionReducer = (
  state = initialState,
  action: AnyAction
): InitialState => {
  return {
    ...state,
    type: action.type,
    count: state.count
  }
}