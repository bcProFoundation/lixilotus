import { Country, State } from '@bcpros/lixi-models';
import { createEntityAdapter, createReducer, isAnyOf, Update } from '@reduxjs/toolkit';

import { getCountriesSuccess, getStatesSuccess } from './actions';
import { CountriesState, StatesState } from './state';

// Coutry
export const countriesAdapter = createEntityAdapter<Country>({});
const initialCountry: CountriesState = countriesAdapter.getInitialState({
  selectedCountryId: 0
});

export const countryReducer = createReducer(initialCountry, builder => {
  builder.addCase(getCountriesSuccess, (state, action) => {
    const countries = action.payload;
    countriesAdapter.setAll(state, countries);
  });
});

// State
export const statesAdapter = createEntityAdapter<State>({});
const initialState: StatesState = statesAdapter.getInitialState({
  selectedStateId: 0
});

export const stateReducer = createReducer(initialState, builder => {
  builder.addCase(getStatesSuccess, (state, action) => {
    const states = action.payload;
    statesAdapter.setAll(state, states);
  });
});
