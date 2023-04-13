import { PageCategory } from '@bcpros/lixi-models';
import { EntityState } from '@reduxjs/toolkit';

export interface CategoriesState extends EntityState<PageCategory> {
  selectedCategoryId: number;
}
