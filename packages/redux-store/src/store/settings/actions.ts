import { FilterBurnCommand } from '@bcpros/lixi-models/src/lib/filter';
import { SearchBoxCommand } from '@bcpros/lixi-models/src/lib/search';
import { createAction } from '@reduxjs/toolkit';

import { WebAuthnConfig, WebPushNotifConfig } from './model';

export const toggleCollapsedSideNav = createAction<boolean>('settings/toggleCollapsedSideNav');
export const updateLocale = createAction<string>('settings/updateLocale');
export const setInitIntlStatus = createAction<boolean>('settings/setInitIntlStatus');
export const setCurrentThemes = createAction<string>('settings/setCurrentThemes');

export const setIsSystemThemes = createAction<boolean>('settings/setIsSystemThemes');

export const loadLocale = createAction<string>('settings/loadLocale');
export const loadLocaleSuccess = createAction<string>('settings/loadLocaleSuccess');
export const loadLocaleFailure = createAction<string>('settings/loadLocaleFailure');
export const saveWebAuthnConfig = createAction<WebAuthnConfig>('settings/saveWebAuthnConfig');
export const saveBurnFilter = createAction<FilterBurnCommand>('settings/saveBurnFilter');
export const saveTopPostsFilter = createAction<boolean>('settings/saveTopPostsFilter');
export const saveWebPushNotifConfig = createAction<WebPushNotifConfig>('settings/saveWebPushNotifConfig');
export const saveAllowPushNotification = createAction<boolean>('settings/saveAllowPushNotification');
