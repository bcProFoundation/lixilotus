export interface CreateRedeemDto {
  redeemAddress: string;
  redeemCode: string;
  captchaToken: string;
}

export interface RedeemDto {
  id?: number;
  redeemAddress: string;
  redeemCode?: string;
  captchaToken?: string;
  transactionId: string;
  amount: number;
  vaultId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Redeem extends RedeemDto {
  id: number;
}

export interface ViewRedeemDto {
  id: number;
  vaultId: number;
  image: string;
  thumbnail: string;
  message: string;
  amount: number;
}