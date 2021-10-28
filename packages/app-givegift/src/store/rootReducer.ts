import { combineReducers } from '@reduxjs/toolkit'
import { history } from '@utils/history';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { PersistConfig } from 'redux-persist';
import { connectRouter } from 'connected-react-router';
import { actionReducer } from './action/reducer';
import { vaultReducer } from './vault/reducer';
import { VaultsState } from './vault/state';


const vaultPersistConfig: PersistConfig<VaultsState> = {
  key: 'vaults',
  storage: storage
};

const rootReducer = combineReducers({
  router: connectRouter(history),
  vaults: persistReducer(vaultPersistConfig, vaultReducer),

  // This is use for useReduxEffect
  // Should be always at the end
  action: actionReducer,
});

export default rootReducer;