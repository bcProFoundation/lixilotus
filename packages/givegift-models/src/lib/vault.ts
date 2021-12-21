export interface GenerateVaultDto {
  name: string;
  isRandomGive: boolean;
  minValue: string;
  maxValue: string;
  fixedValue: string;
  status: string;
}

export interface CreateVaultDto {
  name: string;
  isRandomGive: boolean;
  //encryptedMnemonic: string;
  publicKey: string;
  privateKey: string;
  minValue: number;
  maxValue: number;
  fixedValue: number;
  status: string;
}


export interface VaultDto {
  id?: number;
  name: string;
  isRandomGive: boolean;
  //encryptedMnemonic: string;
  publicKey: string;
  privateKey: string;
  minValue: number;
  maxValue: number;
  fixedValue: number;
  totalRedeem: number;
  createdAt?: Date;
  updatedAt?: Date;
  status: string;
};

export interface Vault {
  id: number;
  name: string;
  mnemonic: string;
  isRandomGive: boolean;
  //encryptedMnemonic: string;
  publicKey: string;
  privateKey: string;
  redeemCode: string;
  minValue: number;
  maxValue: number;
  fixedValue: number;
  totalRedeem: number;
  createdAt?: Date;
  updatedAt?: Date;
  Path10605?: {
    cashAddress: string;
    xAddress: string;
    legacyAddress: string;
  };
  status: string;
};

export interface ImportVaultDto {
  mnemonic: string;
  redeemCode: string;
}