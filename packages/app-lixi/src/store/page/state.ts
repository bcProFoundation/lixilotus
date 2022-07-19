import { EntityState } from '@reduxjs/toolkit';

export interface PageState extends EntityState<any> {
  selectedId: string;
  pagesByAccountId: Array<any>;
}
