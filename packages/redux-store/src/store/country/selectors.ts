import { State } from '@bcpros/lixi-models';
import _ from 'lodash';
import { createSelector } from 'reselect';

import { RootState } from '../store';

import { countriesAdapter, statesAdapter } from './reducer';
import { CountriesState, StatesState } from './state';

export const getCountriesState = createSelector(
  (state: RootState) => state.countries,
  (countries: CountriesState) => countries,
  (states: StatesState) => states
);

// Country
const { selectAll, selectEntities, selectIds, selectTotal } = countriesAdapter.getSelectors();

export const getAllCountries = createSelector((state: RootState) => state.countries, selectAll);

export const getAllCountriesEntities = createSelector((state: RootState) => state.countries, selectEntities);

// State
const selectCountry = (state: RootState) => state.countries;
const selectSelectedCountry = createSelector(selectCountry, state => state.selectCountryId);

const {
  selectAll: selectAllStates,
  selectEntities: selectEntitiesStates,
  selectIds: selectIdsStates,
  selectTotal: selectTotalStates
} = statesAdapter.getSelectors();

export const getAllStates = createSelector((state: RootState) => state.states, selectAllStates);

export const getAllStatesByCountry = (countryId: number) =>
  createSelector([selectSelectedCountry, getAllStates], (states: State[]) =>
    states ? states.filter(state => state?.country.id === countryId) : []
  );
