import { PageCategory } from '@bcpros/lixi-models';
import { createAction } from '@reduxjs/toolkit';

export const getCategories = createAction('data/getCategories');
export const getCategoriesSuccess = createAction<PageCategory[]>('data/getCategoriesSuccess');
export const getCategoriesFailure = createAction<string>('data/getCategoriesFailure');
