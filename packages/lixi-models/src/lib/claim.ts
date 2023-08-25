export interface CreateClaimDto {
  claimAddress: string;
  claimCode: string;
  captchaToken: string;
  nftReceiverAddress?: string;
}

export interface ClaimDto {
  id?: number;
  claimAddress: string;
  claimCode?: string;
  captchaToken?: string;
  transactionId: string;
  amount: number;
  lixiId: number;
  nftTokenId: Nullable<string>;
  nftTokenUrl: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Claim extends ClaimDto {
  id: number;
  message: string;
  image: string;
}

export interface ViewClaimDto {
  id: number;
  lixiId: number;
  image: string;
  thumbnail: string;
  message: string;
  amount: number;
  nftTokenId: Nullable<string>;
  nftTokenUrl: string;
  pageName?: string;
  createDate?: Date;
}
