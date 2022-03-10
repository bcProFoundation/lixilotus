import { Account } from "@bcpros/lixi-models/lib/account";
import { EntityState } from "@reduxjs/toolkit";

export interface AccountsState extends EntityState<Account> {
  selectedId: Nullable<number> | undefined;
  lixiIdsById: {
    [key: number]: Array<number>
  }
}