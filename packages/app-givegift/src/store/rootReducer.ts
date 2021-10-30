import { combineReducers } from '@reduxjs/toolkit'
import { history } from '@utils/history';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { PersistConfig } from 'redux-persist';
import { connectRouter } from 'connected-react-router';
import { actionReducer } from './action/reducer';
import { vaultReducer } from './vault/reducer';
import { VaultsState } from './vault/state';
import { RedeemsState } from './redeem/state';
import { redeemReducer } from './redeem/reducer';


const vaultPersistConfig: PersistConfig<VaultsState> = {
  key: 'vaults',
  storage: storage
};

const redeemsPersistConfig: PersistConfig<RedeemsState> = {
  key: 'redeems',
  storage: storage
};

const rootReducer = combineReducers({
  router: connectRouter(history),
  vaults: persistReducer(vaultPersistConfig, vaultReducer),
  redeems: persistReducer(redeemsPersistConfig, redeemReducer),
  // This is use for useReduxEffect
  // Should be always at the end
  action: actionReducer,
});

export default rootReducer;