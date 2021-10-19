import { Vault } from "@abcpros/givegift-models/lib/vault";

export interface VaultsState {
  vaults: {
    [key: string]: Vault;
  }
}