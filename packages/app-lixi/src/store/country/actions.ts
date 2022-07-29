import { createAction } from '@reduxjs/toolkit';
import { Country, State } from '@bcpros/lixi-models';

export const getCountryActionType = 'country/getCountries';

export const getCountries = createAction('lixi/getCountries');
export const getCountriesSuccess = createAction<Country[]>('lixi/getCountriesSuccess');
export const getCountriesFailure = createAction<string>('lixi/getCountriesFailure');
export const getStates = createAction<number | string>('lixi/getState');
export const getStatesSuccess = createAction<State[]>('lixi/getStateSuccess');
export const getStatesFailure = createAction<string>('lixi/getStateFailure');