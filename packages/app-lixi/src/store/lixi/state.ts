import { Lixi } from "@bcpros/lixi-models/lib/lixi";
import { EntityState } from "@reduxjs/toolkit";

export interface LixiesState extends EntityState<Lixi> {
  selectedId: number;
  claimIdsById: {
    [key: number]: Array<number>
  };
  children: EntityState<Lixi>;
};