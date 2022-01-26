import { Envelope } from "@abcpros/givegift-models";
import { EntityState } from "@reduxjs/toolkit";

export interface EnvelopesState extends EntityState<Envelope> {
  selectedId: number;
}