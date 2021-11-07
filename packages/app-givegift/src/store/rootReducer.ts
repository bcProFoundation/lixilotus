import { combineReducers } from '@reduxjs/toolkit'
import { history } from '@utils/history';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { PersistConfig } from 'redux-persist';
import { connectRouter } from 'connected-react-router';
import { loadingReducer } from './loading/reducer';
import { errorReducer } from './error/reducer';
import { toastReducer } from './toast/reducer';
import { actionReducer } from './action/reducer';
import { vaultReducer } from './vault/reducer';
import { VaultsState } from './vault/state';
import { RedeemsState } from './redeem/state';
import { redeemReducer } from './redeem/reducer';
import { modalReducer } from './modal/reducer';




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
  loading: loadingReducer,
  modal: modalReducer,
  toast: toastReducer,
  error: errorReducer,
  // This is use for useReduxEffect
  // Should be always at the end
  action: actionReducer,
});

export default rootReducer;