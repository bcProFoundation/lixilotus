import { Account } from "@abcpros/givegift-models/lib/account";
import { EntityState } from "@reduxjs/toolkit";

export interface AccountsState extends EntityState<Account> {
  activeId:number;
  vaultIdsById: {
    [key: number]: Array<number>
  }
}