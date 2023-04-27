import { createReducer } from '@reduxjs/toolkit';

import { closeModal, openModal } from './actions';
import { ModalState } from './state';

const initialState: ModalState = {
  modals: []
};

export const modalReducer = createReducer(initialState, builder => {
  builder
    .addCase(openModal, (state, action) => {
      const { modalType, modalProps } = action.payload;

      state.modals.push({
        modalType,
        modalProps
      });
    })
    .addCase(closeModal, (state, action) => {
      state.modals.pop();
    });
});
