import { AnyAction, combineReducers } from '@reduxjs/toolkit';
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
import { lixiReducer } from './lixi/reducer';
import { LixiesState } from './lixi/state';
import { ClaimsState } from './claim/state';
import { claimReducer } from './claim/reducer';
import { modalReducer } from './modal/reducer';
import { settingsReducer } from './settings/reducer';
import { notificationReducer } from './notification/reducer';
import { AccountsState } from './account/state';
import { HYDRATE } from 'next-redux-wrapper';
import { SettingsState } from './settings/state';
import { PageState } from './page/state';
import { pageReducer } from './page/reducer';
import { countryReducer, stateReducer } from './country/reducer';
import { CountriesState, StatesState } from './country/state';

const persistConfig = {
  key: 'root',
  storage: storage,
  blacklist: ['accounts']
};

const accountPersistConfig: PersistConfig<AccountsState> = {
  key: 'accounts',
  storage: storage,
  blacklist: [`envelopeUpload`, 'pageCoverUpload', 'pageAvatarUpload']
};

const lixiPersistConfig: PersistConfig<LixiesState> = {
  key: 'lixies',
  storage: storage
};

const claimsPersistConfig: PersistConfig<ClaimsState> = {
  key: 'claims',
  storage: storage
};

const shopPersistConfig: PersistConfig<PageState> = {
  key: 'pages',
  storage: storage
};

const settingsPersistConfig: PersistConfig<SettingsState> = {
  key: 'settings',
  storage: storage,
  whitelist: ['locale']
};

const countryPersistConfig: PersistConfig<CountriesState> = {
  key: 'countries',
  storage: storage
};

const statePersistConfig: PersistConfig<StatesState> = {
  key: 'states',
  storage: storage
};

export const serverReducer = combineReducers({
  router: routerReducer,
  accounts: accountReducer,
  lixies: lixiReducer,
  claims: claimReducer,
  envelopes: envelopeReducer,
  loading: loadingReducer,
  modal: modalReducer,
  toast: toastReducer,
  error: errorReducer,
  settings: settingsReducer,
  notifications: notificationReducer,
  pages: pageReducer,
  countries: countryReducer,
  states: stateReducer,
  // This is use for useReduxEffect
  // Should be always at the end
  action: actionReducer
});

export const appReducer = combineReducers({
  router: routerReducer,
  accounts: persistReducer(accountPersistConfig, accountReducer),
  lixies: persistReducer(lixiPersistConfig, lixiReducer),
  claims: persistReducer(claimsPersistConfig, claimReducer),
  settings: persistReducer(settingsPersistConfig, settingsReducer),
  pages: persistReducer(shopPersistConfig, pageReducer),
  notifications: notificationReducer,
  envelopes: envelopeReducer,
  loading: loadingReducer,
  modal: modalReducer,
  toast: toastReducer,
  error: errorReducer,
  countries: persistReducer(countryPersistConfig, countryReducer),
  states: persistReducer(statePersistConfig, stateReducer),
  // This is use for useReduxEffect
  // Should be always at the end
  action: actionReducer
});

const reducer = (state, action: AnyAction) => {
  if (action.type === HYDRATE) {
    const nextState = {
      ...state // use previous state
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

export default persistReducer(persistConfig, reducer);
