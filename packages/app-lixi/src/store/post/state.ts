import { EntityState } from '@reduxjs/toolkit';

export interface PostState extends EntityState<any> {
  selectedId: string;
  postsByAccountId: Array<any>;
}
