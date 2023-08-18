import { AnyAction, combineReducers } from '@reduxjs/toolkit';
import { routerReducer } from 'connected-next-router';
import { HYDRATE } from 'next-redux-wrapper';
import { persistReducer } from 'redux-persist';
import { createMigrate, PersistConfig } from 'redux-persist';
import storage from 'redux-persist-indexeddb-storage';

import { accountReducer } from './account/reducer';
import { AccountsState } from './account/state';
import { actionReducer } from './action/reducer';
import { burnReducer } from './burn/reducer';
import { categoryReducer } from './category/reducer';
import { CategoriesState } from './category/state';
import { claimReducer } from './claim/reducer';
import { ClaimsState } from './claim/state';
import { api as commentsApi } from './comment/comments.api';
import { countryReducer, stateReducer } from './country/reducer';
import { CountriesState, StatesState } from './country/state';
import { envelopeReducer } from './envelope/reducer';
import { errorReducer } from './error/reducer';
import { lixiReducer } from './lixi/reducer';
import { LixiesState } from './lixi/state';
import { loadingReducer } from './loading/reducer';
import { localAccountsAdapter, localUserAccountReducer } from './localAccount/reducer';
import { LocalUserAccountsState } from './localAccount/state';
import { modalReducer } from './modal/reducer';
import { actionSheetReducer } from './action-sheet/reducer';
import { notificationReducer } from './notification/reducer';
import { api as pagesApi } from './page/pages.api';
import { pageReducer } from './page/reducer';
import { PageState } from './page/state';
import { api as postApi } from './post/posts.api';
import { api as messageApi } from './message/message.api';
import { api as pageMessageApi } from './message/pageMessageSession.api';
import { postReducer } from './post/reducer';
import { PostState } from './post/state';
import { settingsReducer } from './settings/reducer';
import { SettingsState } from './settings/state';
import { toastReducer } from './toast/reducer';
import { tokenReducer, TokenState } from './token';
import { walletStateReducer } from './wallet/reducer';
import { api as worshipedPersonApi } from './worship/worshipedPerson.api';

const migration = {
  0: state => {
    return {
      ...state,
      burn: {
        ...state.burn,
        burnQueue: [],
        failQueue: []
      }
    };
  }
};

const persistConfig = {
  timeout: 1000,
  key: 'root',
  version: 0,
  storage: storage('lixi-indexeddb'),
  blacklist: [
    'accounts',
    'router',
    'modal',
    'action-sheet',
    'toast',
    'wallet',
    'api',
    'root',
    'posts',
    'pages',
    'burn',
    'loading',
    'notifications'
  ],
  migrate: createMigrate(migration, { debug: false })
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
  blacklist: [
    `envelopeUpload`,
    'pageCoverUpload',
    'pageAvatarUpload',
    'postCoverUploads',
    'messageUploads',
    'leaderBoard',
    'graphqlRequestLoading',
    'productImageUploads'
  ],
  timeout: 0
};
const postPersistConfig: PersistConfig<PostState> = {
  key: 'posts',
  storage: storage('lixi-indexeddb'),
  blacklist: ['selectedId']
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
  storage: storage('lixi-indexeddb'),
  blacklist: ['currentPageMessageSession']
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
  posts: postReducer,
  lixies: lixiReducer,
  claims: claimReducer,
  envelopes: envelopeReducer,
  loading: loadingReducer,
  modal: modalReducer,
  actionSheet: actionSheetReducer,
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
  posts: persistReducer(postPersistConfig, postReducer),
  lixies: persistReducer(lixiPersistConfig, lixiReducer),
  claims: persistReducer(claimsPersistConfig, claimReducer),
  settings: persistReducer(settingsPersistConfig, settingsReducer),
  pages: persistReducer(shopPersistConfig, pageReducer),
  tokens: tokenReducer,
  notifications: notificationReducer,
  envelopes: envelopeReducer,
  loading: loadingReducer,
  modal: modalReducer,
  actionSheet: actionSheetReducer,
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
  [messageApi.reducerPath]: messageApi.reducer,
  [pageMessageApi.reducerPath]: pageMessageApi.reducer,
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
