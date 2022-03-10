export interface CreateClaimDto {
  claimAddress: string;
  claimCode: string;
  captchaToken: string;
}

export interface ClaimDto {
  id?: number;
  claimAddress: string;
  claimCode?: string;
  captchaToken?: string;
  transactionId: string;
  amount: number;
  lixiId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Claim extends ClaimDto {
  id: number;
}

export interface ViewClaimDto {
  id: number;
  lixiId: number;
  image: string;
  thumbnail: string;
  message: string;
  amount: number;
}