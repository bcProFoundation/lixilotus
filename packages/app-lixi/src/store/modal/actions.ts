import { createAction } from '@reduxjs/toolkit';

export const openModal = createAction('modal/openModal', (modalType: string, modalProps: any) => {
  return {
    payload: {
      modalType,
      modalProps
    }
  };
});

export const closeModal = createAction('modal/closeModal');