import { Account } from '@bcpros/lixi-models/lib/account';
import { Upload } from '@bcpros/lixi-models/lib/upload';
import { EntityState } from '@reduxjs/toolkit';
import { WorshipedPersonFieldsFragment as WorshipedPerson } from '@store/worship/worshipedPerson.generated';

export interface AccountsState extends EntityState<Account> {
  selectedId: Nullable<number> | undefined;
  lixiIdsById: {
    [key: number]: Array<number>;
  };
  envelopeUpload: Upload;
  pageCoverUpload: Upload;
  pageAvatarUpload: Upload;
  postCoverUploads: Upload[];
  editorCache: Nullable<string> | undefined;
  transactionReady: boolean;
  recentVisitedPeople: WorshipedPerson[];
}
