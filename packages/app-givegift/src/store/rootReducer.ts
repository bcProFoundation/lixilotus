import { combineReducers } from '@reduxjs/toolkit'
import { vaultReducer } from './vault/reducer';

const rootReducer = combineReducers({
  vaults: vaultReducer
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;