import { createAction } from '@reduxjs/toolkit';
import { City, Country, State } from '@bcpros/lixi-models';

export const getCountryActionType = 'country/getCountry';

export const getCountry = createAction('lixi/getCountry');
export const getCountrySuccess = createAction<Country[]>('lixi/getCountrySuccess');
export const getCountryFailure = createAction<string>('lixi/getCountryFailure');
export const getState = createAction<number | string>('lixi/getState');
export const getStateSuccess = createAction<State[]>('lixi/getStateSuccess');
export const getStateFailure = createAction<string>('lixi/getStateFailure');
// export const getCity = createAction<number>('lixi/getCity');
// export const getCitySuccess = createAction<City[]>('lixi/getCitySuccess');
// export const getCityFailure = createAction<string>('lixi/getCityFailure');