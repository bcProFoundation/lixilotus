export class PageDto {
  id: string;
  pageAccountId: number;
  name: string;
  title: string;
  categoryId: number;
  walletAddress: string;
  description: string;
  avatar: string;
  cover: string;
  parentId?: Nullable<string>;
  address?: string;
  website: string;
  countryId?: number;
  stateId?: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<PageDto>) {
    Object.assign(this, partial);
  }
}
