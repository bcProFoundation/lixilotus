import { CreatePageCommand, Page } from '@bcpros/lixi-models/src';
import { createAction } from '@reduxjs/toolkit';

export const setSelectedPage = createAction<string>('pages/getSelectedId');
export const setPagesByAccountId = createAction<any>('pages/setPagesByAccountId');
export const getPagesByAccountId = createAction<any>('pages/getPagesAccountId');
export const postPage = createAction<CreatePageCommand>('pages/postPage');
export const postPageSuccess = createAction<any>('pages/postPageSuccess');
export const postPageFailure = createAction<string>('pages/postPageFailure');
export const setPage = createAction<Page>('pages/setPage');
