import { createAction } from '@reduxjs/toolkit';

export const toggleCollapsedSideNav = createAction<boolean>('settings/toggleCollapsedSideNav');
export const updateLocale = createAction<string>('settings/updateLocale');
export const setInitIntlStatus = createAction<boolean>('settings/setInitIntlStatus');
export const loadLocale = createAction<string>('settings/loadLocale');
export const loadLocaleSuccess = createAction<string>('settings/loadLocaleSuccess');
export const loadLocaleFailure = createAction<string>('settings/loadLocaleFailure');