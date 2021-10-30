import { Vault } from "@abcpros/givegift-models/lib/vault";
import { EntityState } from "@reduxjs/toolkit";

export interface VaultsState extends EntityState<Vault> {
  selectedId: number;
  redeemIdsById: {
    [key: number]: Array<number>
  }
}