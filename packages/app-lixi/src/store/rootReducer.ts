import { AnyAction, combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist-indexeddb-storage';
import { PersistConfig } from 'redux-persist';
import { routerReducer } from 'connected-next-router';
import { loadingReducer } from './loading/reducer';
import { errorReducer } from './error/reducer';
import { toastReducer } from './toast/reducer';
import { actionReducer } from './action/reducer';
import { burnReducer } from './burn/reducer';
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
import { api as pagesApi } from './page/pages.api';
import { api as postApi } from './post/posts.api';
import { api as commentsApi } from './comment/comments.api';
import { api as worshipedPersonApi } from './worship/worshipedPerson.api';
import { LocalUserAccountsState } from './localAccount/state';
import { localAccountsAdapter, localUserAccountReducer } from './localAccount/reducer';
import { postReducer } from './post/reducer';
import { PostState } from './post/state';
import { walletStateReducer } from './wallet/reducer';
import { tokenReducer, TokenState } from './token';
import { CategoriesState } from './category/state';
import { categoryReducer } from './category/reducer';

const persistConfig = {
  key: 'root',
  storage: storage('lixi-indexeddb'),
  blacklist: ['accounts', 'router', 'modal', 'wallet', 'api', 'root', 'posts', 'pages']
};

const walletPersistConfig = {
  key: 'wallet',
  storage: storage('lixi-indexeddb')
};

const localAccountPersistConfig: PersistConfig<LocalUserAccountsState> = {
  key: 'localAccounts',
  storage: storage('lixi-indexeddb')
};

const accountPersistConfig: PersistConfig<AccountsState> = {
  key: 'accounts',
  storage: storage('lixi-indexeddb'),
  blacklist: [`envelopeUpload`, 'pageCoverUpload', 'pageAvatarUpload', 'postCoverUploads'],
  timeout: 0
};

const lixiPersistConfig: PersistConfig<LixiesState> = {
  key: 'lixies',
  storage: storage('lixi-indexeddb')
};

const claimsPersistConfig: PersistConfig<ClaimsState> = {
  key: 'claims',
  storage: storage('lixi-indexeddb')
};

const shopPersistConfig: PersistConfig<PageState> = {
  key: 'pages',
  storage: storage('lixi-indexeddb')
};

const settingsPersistConfig: PersistConfig<SettingsState> = {
  key: 'settings',
  storage: storage('lixi-indexeddb'),
  whitelist: ['locale']
};

const countryPersistConfig: PersistConfig<CountriesState> = {
  key: 'countries',
  storage: storage('lixi-indexeddb')
};

const statePersistConfig: PersistConfig<StatesState> = {
  key: 'states',
  storage: storage('lixi-indexeddb')
};

const categoryPersistConfig: PersistConfig<CategoriesState> = {
  key: 'categories',
  storage: storage('lixi-indexeddb')
};

export const serverReducer = combineReducers({
  router: routerReducer,
  wallet: walletStateReducer,
  accounts: accountReducer,
  localAccounts: localUserAccountReducer,
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
  tokens: tokenReducer,
  countries: countryReducer,
  states: stateReducer,
  categories: categoryReducer,
  burn: burnReducer,
  // This is use for useReduxEffect
  // Should be always at the end
  action: actionReducer
});

export const appReducer = combineReducers({
  router: routerReducer,
  wallet: persistReducer(walletPersistConfig, walletStateReducer),
  accounts: persistReducer(accountPersistConfig, accountReducer),
  localAccounts: persistReducer(localAccountPersistConfig, localUserAccountReducer),
  lixies: persistReducer(lixiPersistConfig, lixiReducer),
  claims: persistReducer(claimsPersistConfig, claimReducer),
  settings: persistReducer(settingsPersistConfig, settingsReducer),
  pages: persistReducer(shopPersistConfig, pageReducer),
  tokens: tokenReducer,
  notifications: notificationReducer,
  envelopes: envelopeReducer,
  loading: loadingReducer,
  modal: modalReducer,
  toast: toastReducer,
  error: errorReducer,
  countries: persistReducer(countryPersistConfig, countryReducer),
  states: persistReducer(statePersistConfig, stateReducer),
  categories: persistReducer(categoryPersistConfig, categoryReducer),
  burn: burnReducer,
  [pagesApi.reducerPath]: pagesApi.reducer,
  [postApi.reducerPath]: postApi.reducer,
  [commentsApi.reducerPath]: commentsApi.reducer,
  [worshipedPersonApi.reducerPath]: worshipedPersonApi.reducer,
  // This is use for useReduxEffect
  // Should be always at the end
  action: actionReducer
});

const reducer = (state, action: AnyAction) => {
  if (action.type === HYDRATE) {
    // const { api: _ignore_and_let_RTK_handle_this, router, ...hydrate } = action.payload;
    const nextState = {
      ...state // use previous state
      // ...action.payload, // apply delta from hydration
      // ...hydrate
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
