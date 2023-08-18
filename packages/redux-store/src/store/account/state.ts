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
  accountCoverUpload: Upload;
  accountAvatarUpload: Upload;
  pageCoverUpload: Upload;
  pageAvatarUpload: Upload;
  postCoverUploads: Upload[];
  messageUploads: Upload[];
  editorCache: Nullable<string> | undefined;
  leaderBoard: Array<Account & { totalBurned: number }>;
  transactionReady: boolean;
  graphqlRequestLoading: boolean;
  recentVisitedPeople: WorshipedPerson[];
  recentHashtagAtHome: string[];
  recentHashtagAtPages:
    | [
        {
          id: string | null;
          hashtags: string[];
        }
      ]
    | [];
  recentHashtagAtToken:
    | [
        {
          id: string | null;
          hashtags: string[];
        }
      ]
    | [];
  accountInfoTemp: Account;
}
