import { LocalUserAccount } from '@bcpros/lixi-models/lib/account';
import { Upload } from '@bcpros/lixi-models/lib/upload';
import { EntityState } from '@reduxjs/toolkit';

export interface LocalUserAccountsState extends EntityState<LocalUserAccount> {
  selectedId: Nullable<string> | undefined;
}
