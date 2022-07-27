export class PageDto {
  id: string;
  pageAccountId: number;
  name: string;
  title: string;
  walletAddress: string;
  description: string;
  avatar: string;
  cover: string;
  parentId?: Nullable<string>;
  address?: string;
  website: string;
  country?: string;
  state?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<PageDto>) {
    Object.assign(this, partial);
  }
}