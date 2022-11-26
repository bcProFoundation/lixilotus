import { EntityState } from '@reduxjs/toolkit';

export interface TokenState extends EntityState<any> {
  selectedTokenId: object;
  getTokenById: object;
}
