import { PageCategory } from '@bcpros/lixi-models';
import { createEntityAdapter, createReducer, isAnyOf, Update } from '@reduxjs/toolkit';

import { getCategoriesSuccess } from './actions';
import { CategoriesState } from './state';

// Coutry
export const categoriesAdapter = createEntityAdapter<PageCategory>({});
const initialCategory: CategoriesState = categoriesAdapter.getInitialState({
  selectedCategoryId: 0
});

export const categoryReducer = createReducer(initialCategory, builder => {
  builder.addCase(getCategoriesSuccess, (state, action) => {
    const categories = action.payload;
    categoriesAdapter.setAll(state, categories);
  });
});
