import { combineReducers } from '@reduxjs/toolkit'
import { history } from '@utils/history';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { PersistConfig } from 'redux-persist';
import { connectRouter } from 'connected-react-router';
import { vaultReducer } from './vault/reducer';
import { VaultsState } from './vault/state';

const vaultPersistConfig: PersistConfig<VaultsState> = {
  key: 'vaults',
  storage: storage
};

const rootReducer = combineReducers({
  router: connectRouter(history),
  vaults: persistReducer(vaultPersistConfig, vaultReducer)
});

export default rootReducer;