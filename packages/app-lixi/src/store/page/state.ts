import { PageDetail } from './pageDetail.model';
import { EntityState } from '@reduxjs/toolkit';

export interface PageState extends EntityState<PageDetail> {
  selectedId: string;
}
