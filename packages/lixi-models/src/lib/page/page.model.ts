import { Account } from '../account';

export interface Page {
  id: string;
  pageAccount: Account;
  name: string;
  title: string;
  description: string;
  avatar: string;
  cover: string;
  parentId: Nullable<string>;
  handleId: string;
  address: string;
  website: string;
  createdAt: Date;
  updatedAt: Date;
}
