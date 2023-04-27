import { PageCategory } from '@bcpros/lixi-models';
import { createEntityAdapter, createReducer, isAnyOf, Update } from '@reduxjs/toolkit';
import { CategoriesState } from './state';
import { getCategoriesSuccess } from './actions';

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
