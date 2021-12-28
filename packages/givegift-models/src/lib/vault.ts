export interface GenerateVaultDto {
  name: string;
  maxRedeem: string;
  vaultType: number;
  minValue: string;
  maxValue: string;
  fixedValue: string;
  dividedValue: string;
}

export interface CreateVaultDto {
  name: string;
  maxRedeem: number;
  redeemedNum?: number;
  vaultType: number;
  mnemonic: string;
  minValue: number;
  maxValue: number;
  fixedValue: number;
  dividedValue: number;
}


export interface VaultDto {
  id?: number;
  name: string;
  maxRedeem: number;
  redeemedNum: number;
  vaultType: number;
  encryptedPubKey: string;
  encryptedPrivKey: string;
  minValue: number;
  maxValue: number;
  fixedValue: number;
  dividedValue: number;
  totalRedeem: number;
  createdAt?: Date;
  updatedAt?: Date;
  status: string;
};

export interface Vault {
  id: number;
  name: string;
  maxRedeem: number;
  redeemedNum: number;
  vaultType: number;
  encryptedPubKey: string;
  encryptedPrivKey: string;
  redeemCode?: string;
  minValue: number;
  maxValue: number;
  fixedValue: number;
  dividedValue: number;
  totalRedeem: number;
  createdAt?: Date;
  updatedAt?: Date;
  balance?: number;
  Path10605?: {
    cashAddress: string;
    xAddress: string;
    legacyAddress: string;
  };
  status: string;
  accountId: number;
};

export interface ImportVaultDto {
  encryptedPrivKey: string;
  redeemCode: string;
}

export enum VaultType {
  Random = 0,
  Fixed = 1,
  Divided = 2
};