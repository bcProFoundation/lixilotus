import { combineReducers } from '@reduxjs/toolkit'
import { history } from '@utils/history';
import { connectRouter } from 'connected-react-router';
import { vaultReducer } from './vault/reducer';

const rootReducer = combineReducers({
  router: connectRouter(history),
  vaults: vaultReducer
});

export default rootReducer;