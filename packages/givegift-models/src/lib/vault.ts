export interface GenerateVaultDto {
  name: string;
  isRandomGive: boolean;
  minValue: string;
  maxValue: string;
  fixedValue: string;
}

export interface CreateVaultDto {
  name: string;
  isRandomGive: boolean;
  encryptedMnemonic: string;
  minValue: number;
  maxValue: number;
  fixedValue: number;
}


export interface VaultDto {
  id?: number;
  name: string;
  isRandomGive: boolean;
  encryptedMnemonic: string;
  minValue: number;
  maxValue: number;
  fixedValue: number;
  totalRedeem: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export interface Vault {
  id: number;
  name: string;
  mnemonic: string;
  isRandomGive: boolean;
  encryptedMnemonic: string;
  redeemCode: string;
  minValue: number;
  maxValue: number;
  fixedValue: number;
  totalRedeem: number;
  createdAt?: Date;
  updatedAt?: Date;
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