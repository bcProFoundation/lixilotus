import { Token } from '@bcpros/lixi-models';
import { EntityState } from '@reduxjs/toolkit';

export interface TokenState extends EntityState<Token> {
  selectedTokenId: object;
  getTokenById: object;
}
