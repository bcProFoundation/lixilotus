import { Envelope } from '@bcpros/lixi-models';
import { EntityState } from '@reduxjs/toolkit';

export interface EnvelopesState extends EntityState<Envelope> {
  selectedId: number;
}
