import { createAction } from '@reduxjs/toolkit';

export const toggleCollapsedSideNav = createAction<boolean>('settings/toggleCollapsedSideNav');