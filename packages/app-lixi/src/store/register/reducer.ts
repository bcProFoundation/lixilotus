import { createReducer } from '@reduxjs/toolkit';
import { saveClaimCode } from '@store/claim/actions';
import { registerLixiPackSuccess } from '@store/lixi/actions';
import { RegisterState } from './state';

const initialState: RegisterState = {
  currentClaimCodeRegister: ''
};

export const registerReducer = createReducer(initialState, builder => {
  builder
    .addCase(registerLixiPackSuccess, (state, action) => {
      const result = action.payload;
      state.currentClaimCodeRegister = '';
    })
    .addCase(saveClaimCode, (state, action) => {
      state.currentClaimCodeRegister = action.payload;
    });
});
