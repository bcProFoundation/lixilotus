export interface GenerateVaultDto {
  name: string;
  maxRedeem: string;
  isRandomGive: boolean;
  vaultType: number;
  minValue: string;
  maxValue: string;
  fixedValue: string;
  dividedValue: string;
  expiryAt?: string;
  country?: string;
}

export interface CreateVaultDto {
  name: string;
  maxRedeem: number;
  redeemedNum?: number;
  isRandomGive: boolean;
  vaultType: number;
  encryptedMnemonic: string;
  minValue: number;
  maxValue: number;
  fixedValue: number;
  dividedValue: number;
  expiryAt?: Date;
  country?: string;
}


export interface VaultDto {
  id?: number;
  name: string;
  maxRedeem: number;
  redeemedNum: number;
  isRandomGive: boolean;
  vaultType: number;
  encryptedMnemonic: string;
  minValue: number;
  maxValue: number;
  fixedValue: number;
  dividedValue: number;
  totalRedeem: number;
  createdAt?: Date;
  updatedAt?: Date;
  expiryAt?: Date;
  country?: string;
};

export interface Vault {
  id: number;
  name: string;
  maxRedeem: number;
  redeemedNum?: number;
  mnemonic: string;
  isRandomGive: boolean;
  vaultType: number;
  encryptedMnemonic: string;
  redeemCode: string;
  minValue: number;
  maxValue: number;
  fixedValue: number;
  dividedValue: number;
  totalRedeem: number;
  createdAt?: Date;
  updatedAt?: Date;
  expiryAt?: Date;
  country?: string;
  balance: number;
  Path10605?: {
    cashAddress: string;
    xAddress: string;
    legacyAddress: string;
  }
};

export interface ImportVaultDto {
  mnemonic: string;
  redeemCode: string;
}

export enum VaultType {
  Random = 0,
  Fixed = 1,
  Divided = 2
};