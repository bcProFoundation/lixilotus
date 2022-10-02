import { LocalUserAccount } from '@bcpros/lixi-models/lib/account';
import { EntityState } from '@reduxjs/toolkit';

export interface LocalUserAccountsState extends EntityState<LocalUserAccount> {
  selectedId: Nullable<string> | undefined;
}
