export interface GenerateVaultCommand {
  name: string;
  accountId: number;
  mnemonic: string;
  mnemonicHash: string;
  maxRedeem: string;
  vaultType: number;
  minValue: string;
  maxValue: string;
  fixedValue: string;
  dividedValue: string;
  expiryAt?: string;
  country?: string;
  isFamilyFriendly: boolean;
}

export interface CreateVaultCommand {
  name: string;
  accountId: number
  maxRedeem: number;
  vaultType: number;
  mnemonic: string;
  mnemonicHash: string;
  minValue: number;
  maxValue: number;
  fixedValue: number;
  dividedValue: number;
  expiryAt?: Date;
  country?: string;
  isFamilyFriendly: boolean;
  password: string;
}


export interface VaultDto {
  id?: number;
  name: string;
  maxRedeem: number;
  redeemedNum: number;
  vaultType: number;
  redeemCode?: string;
  minValue: number;
  maxValue: number;
  fixedValue: number;
  dividedValue: number;
  encryptedRedeemCode: string;
  totalRedeem: number;
  createdAt?: Date;
  updatedAt?: Date;
  expiryAt?: Date;
  country?: string;
  isFamilyFriendly: boolean;
  balance?: number;
  address: string;
  status: string;
  accountId: number;
};

export interface Vault {
  id: number;
  name: string;
  maxRedeem: number;
  redeemedNum: number;
  vaultType: number;
  redeemCode?: string;
  minValue: number;
  maxValue: number;
  fixedValue: number;
  dividedValue: number;
  encryptedRedeemCode: string;
  totalRedeem: number;
  createdAt?: Date;
  updatedAt?: Date;
  expiryAt?: Date;
  country?: string;
  isFamilyFriendly: boolean;
  balance?: number;
  address: string;
  status: string;
  accountId: number;
};

export enum VaultType {
  Random = 0,
  Fixed = 1,
  Divided = 2
};