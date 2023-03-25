import _ from 'lodash';
import { createSelector } from 'reselect';
import { RootState } from '../store';
import { categoriesAdapter } from './reducer';
import { CategoriesState } from './state';

export const getCategoriesState = createSelector(
  (state: RootState) => state.categories,
  (categories: CategoriesState) => categories
);

const { selectAll, selectEntities, selectIds, selectTotal } = categoriesAdapter.getSelectors();

export const getAllCategories = createSelector((state: RootState) => state.categories, selectAll);

export const getAllCategoriesEntities = createSelector((state: RootState) => state.categories, selectEntities);
