import { AnyAction, combineReducers } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { PersistConfig } from 'redux-persist';
import { routerReducer } from 'connected-next-router';
import { loadingReducer } from './loading/reducer';
import { errorReducer } from './error/reducer';
import { toastReducer } from './toast/reducer';
import { actionReducer } from './action/reducer';
import { accountReducer } from './account/reducer';
import { envelopeReducer } from './envelope/reducer';
import { vaultReducer } from './vault/reducer';
import { VaultsState } from './vault/state';
import { RedeemsState } from './redeem/state';
import { redeemReducer } from './redeem/reducer';
import { modalReducer } from './modal/reducer';
import { settingsReducer } from './settings/reducer';
import { AccountsState } from './account/state';
import { HYDRATE } from 'next-redux-wrapper';




const accountPersistConfig: PersistConfig<AccountsState> = {
  key: 'accounts',
  storage: storage
};

const vaultPersistConfig: PersistConfig<VaultsState> = {
  key: 'vaults',
  storage: storage
};

const redeemsPersistConfig: PersistConfig<RedeemsState> = {
  key: 'redeems',
  storage: storage
};

export const serverReducer = combineReducers({
  router: routerReducer,
  accounts: accountReducer,
  vaults: vaultReducer,
  redeems: redeemReducer,
  envelopes: envelopeReducer,
  loading: loadingReducer,
  modal: modalReducer,
  toast: toastReducer,
  error: errorReducer,
  settings: settingsReducer,
  // This is use for useReduxEffect
  // Should be always at the end
  action: actionReducer,
});

export const appReducer = combineReducers({
  router: routerReducer,
  accounts: persistReducer(accountPersistConfig, accountReducer),
  vaults: persistReducer(vaultPersistConfig, vaultReducer),
  redeems: persistReducer(redeemsPersistConfig, redeemReducer),
  envelopes: envelopeReducer,
  loading: loadingReducer,
  modal: modalReducer,
  toast: toastReducer,
  error: errorReducer,
  settings: settingsReducer,
  // This is use for useReduxEffect
  // Should be always at the end
  action: actionReducer,
});

const reducer = (state, action: AnyAction) => {
  if (action.type === HYDRATE) {
    const nextState = {
      ...state, // use previous state
      // ...action.payload, // apply delta from hydration
    };
    if (typeof window !== 'undefined' && state?.router) {
      // preserve router value on client side navigation
      nextState.router = state.router;
    }
    return nextState;
  } else {
    return appReducer(state, action);
  }
};


export default reducer;