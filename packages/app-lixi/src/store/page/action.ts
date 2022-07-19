import { createAction } from '@reduxjs/toolkit';

export const setSelectedPage = createAction<string>('page/getSelectedId');
