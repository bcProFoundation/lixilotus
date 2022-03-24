import { Envelope } from "./envelope";

export interface GenerateLixiCommand {
  name: string;
  accountId: number;
  mnemonic: string;
  mnemonicHash: string;
  maxClaim: string;
  claimType: number;
  lixiType: number;
  minValue: string;
  maxValue: string;
  fixedValue: string;
  dividedValue: string;
  amount: string;
  numberOfSubLixi: string;
  parentId?: number;
  minStaking: string;
  expiryAt?: string;
  country?: string;
  isFamilyFriendly: boolean;
  envelopeId: number | null;
  envelopeMessage: string;
}

export interface CreateLixiCommand {
  name: string;
  accountId: number;
  maxClaim: number;
  claimType: number;
  lixiType: number;
  mnemonic: string;
  mnemonicHash: string;
  minValue: number;
  maxValue: number;
  fixedValue: number;
  dividedValue: number;
  amount: number;
  numberOfSubLixi: number;
  parentId?: number;
  minStaking: number;
  expiryAt?: Date;
  country?: string;
  isFamilyFriendly: boolean;
  password: string;
  envelopeId: number | null;
  envelopeMessage: string;
}


export interface LixiDto {
  id?: number;
  name: string;
  maxClaim: number;
  claimedNum: number;
  claimType: number;
  lixiType: number;
  claimCode?: string;
  minValue: number;
  maxValue: number;
  fixedValue: number;
  dividedValue: number;
  encryptedClaimCode?: string;
  totalClaim: number;
  createdAt?: Date;
  updatedAt?: Date;
  minStaking: number;
  expiryAt?: Date;
  country?: string;
  isFamilyFriendly?: boolean;
  balance?: number;
  address: string;
  status: string;
  accountId: number;
  amount: number;
  numberOfSubLixi: number;
  parentId?: number;
  isClaimed?: boolean;
  envelopeId: number | null;
  envelopeMessage: string;
  envelope?: Envelope | null;
};

export interface Lixi {
  id: number;
  name: string;
  maxClaim: number;
  claimedNum: number;
  claimType: number;
  lixiType: number;
  claimCode?: string;
  minValue: number;
  maxValue: number;
  fixedValue: number;
  dividedValue: number;
  encryptedClaimCode: string;
  totalClaim: number;
  createdAt?: Date;
  updatedAt?: Date;
  minStaking: number;
  expiryAt?: Date;
  country?: string;
  isFamilyFriendly: boolean;
  balance?: number;
  address: string;
  status: string;
  accountId: number;
  amount: number;
  numberOfSubLixi: number;
  parentId?: number;
  isClaimed?: boolean;
  envelopeId: number | null;
  envelopeMessage: string;
  envelope?: Envelope | null;
};

export interface UnlockLixiCommand {
  id: number;
  mnemonic: string;
  mnemonicHash: string;
};

export interface LockLixiCommand {
  id: number;
  mnemonic: string;
  mnemonicHash: string;
};

export interface WithdrawLixiCommand {
  id: number;
  mnemonic: string;
  mnemonicHash: string;
};

export interface ExportLixiCommand {
  id: number;
  mnemonicHash: string;
}

export enum LixiType {
  Random = 0,
  Fixed = 1,
  Divided = 2,
  Equal = 3
};

export enum ClaimType {
  Single = 0,
  OneTime = 1,
};
