import { createSelector } from 'reselect';

import { RootState } from '../store';

import { ModalState } from './state';

export const getModals = createSelector(
  (state: RootState) => state.modal,
  (state: ModalState) => state.modals
);
