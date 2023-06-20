import { EntityState } from '@reduxjs/toolkit';

export interface PostState extends EntityState<any> {
  isNewPost: boolean;
  selectedId: string;
  postsByAccountId: Array<any>;
}
