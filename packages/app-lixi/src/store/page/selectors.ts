import { createSelector } from 'reselect';
import { RootState } from '../store';
import { pageAdapter } from './reducer';
import { PageState } from './state';

const { selectAll, selectEntities, selectIds, selectTotal } = pageAdapter.getSelectors();

export const getSelectedPageId = createSelector(
  (state: RootState) => state.pages,
  (state: PageState) => state.selectedId
);
