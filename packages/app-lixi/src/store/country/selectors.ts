import _ from 'lodash';
import { createSelector } from 'reselect';
import { RootState } from '../store';
import { countriesAdapter, statesAdapter } from "./reducer";
import { CountriesState, StatesState } from "./state";
import { countries } from '../../../../lixi-models/src/constants/countries';
import { State } from '@bcpros/lixi-models';

export const getCountriesState = createSelector(
  (state: RootState) => state.countries,
  (countries: CountriesState) => countries,
  (states: StatesState) => states,
);


// Country
const {
  selectAll,
  selectEntities,
  selectIds,
  selectTotal
} = countriesAdapter.getSelectors();

export const getAllCountries = createSelector(
  (state: RootState) => state.countries,
  selectAll
);

export const getAllCountriesEntities = createSelector(
  (state: RootState) => state.countries,
  selectEntities
);

// State
const selectCountry = (state: RootState) => state.countries
const selectSelectedCountry = createSelector(
  selectCountry,
  (state) => state.selectCountryId
)

const {
  selectAll: selectAllStates,
  selectEntities: selectEntitiesStates,
  selectIds: selectIdsStates,
  selectTotal: selectTotalStates
} = statesAdapter.getSelectors();

export const getAllStates = createSelector(
  (state: RootState) => state.states,
  selectAllStates
);

export const getAllStatesBySelectedCountry = createSelector(
  [selectSelectedCountry, getAllStates],
  (countryId, states: State[]) => states.filter(state => state.countryId === countryId)
)