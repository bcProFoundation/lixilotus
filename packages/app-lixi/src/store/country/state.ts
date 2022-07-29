import { Country, State } from '@bcpros/lixi-models';
import { EntityState } from '@reduxjs/toolkit';

export interface CountriesState extends EntityState<Country> {
  selectedCountryId: number;
}

export interface StatesState extends EntityState<State> {
  selectedStateId: number;
}
