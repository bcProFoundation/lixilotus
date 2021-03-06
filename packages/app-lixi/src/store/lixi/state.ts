import { Lixi } from '@bcpros/lixi-models/lib/lixi';
import { EntityState } from '@reduxjs/toolkit';

export interface LixiesState extends EntityState<Lixi> {
  selectedId: number;
  claimIdsById: {
    [key: number]: Array<number>;
  };
  subLixies: EntityState<Lixi>;
  subLixiesCount: number;
  currentSubLixiesStartId: number;
  hasMoreSubLixies: boolean;
}
