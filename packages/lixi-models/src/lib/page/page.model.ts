import { Account } from '../account';

export class Page {
  id: string;
  pageAccountId: number;
  pageAccount: Account;
  name: string;
  title: string;
  description: string;
  avatar: string;
  cover: string;
  parentId?: Nullable<string>;
  address: string;
  website: string;
  createdAt: Date;
  updatedAt: Date;
  country?: string;
  state?: string;
}
