import { createAction } from '@reduxjs/toolkit';
import { WebAuthnConfig } from './model';
import { FilterBurnCommand } from '@bcpros/lixi-models/src/lib/filter';

export const toggleCollapsedSideNav = createAction<boolean>('settings/toggleCollapsedSideNav');
export const updateLocale = createAction<string>('settings/updateLocale');
export const setInitIntlStatus = createAction<boolean>('settings/setInitIntlStatus');
export const loadLocale = createAction<string>('settings/loadLocale');
export const loadLocaleSuccess = createAction<string>('settings/loadLocaleSuccess');
export const loadLocaleFailure = createAction<string>('settings/loadLocaleFailure');
export const saveWebAuthnConfig = createAction<WebAuthnConfig>('settings/saveWebAuthnConfig');
export const saveBurnFilter = createAction<FilterBurnCommand>('settings/saveBurnFilter');
