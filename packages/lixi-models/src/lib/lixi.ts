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
  parentId?: Nullable<number>;
  minStaking: string;
  expiryAt?: string;
  activationAt?: string;
  country?: string;
  isFamilyFriendly: boolean;
  envelopeId: Nullable<number>;
  envelopeMessage: string;
  numberPerPackage?: Nullable<string>;
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
  numberOfSubLixi?: Nullable<number>;
  parentId?: number;
  minStaking: number;
  expiryAt?: Date;
  activationAt?: Date;
  country?: string;
  isFamilyFriendly: boolean;
  password: string;
  envelopeId: Nullable<number>;
  envelopeMessage: string;
  numberPerPackage?: Nullable<number>;
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
  activationAt?: Date;
  country?: string;
  isFamilyFriendly?: boolean;
  balance?: number;
  address: string;
  status: string;
  accountId: number;
  amount: number;
  numberOfSubLixi: Nullable<number>;
  parentId?: Nullable<number>;
  isClaimed?: Nullable<boolean>;
  envelopeId: Nullable<number>;
  envelopeMessage: string;
  envelope?: Nullable<Envelope>;
  claimCount?: number;
  subLixiTotalClaim?: number;
  subLixiBalance?: number;
  numberPerPackage?: Nullable<number>;
  packCode?: Nullable<string>;
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
  activationAt?: Nullable<Date>;
  country?: string;
  isFamilyFriendly: boolean;
  balance?: number;
  address: string;
  status: string;
  accountId: number;
  amount: number;
  numberOfSubLixi: Nullable<number>;
  parentId?: Nullable<number>;
  isClaimed?: Nullable<boolean>;
  envelopeId: Nullable<number>;
  envelopeMessage: string;
  envelope?: Nullable<Envelope>;
  claimCount?: number;
  subLixiTotalClaim?: number;
  subLixiBalance?: number;
  numberPerPackage?: Nullable<number>;
  packCode?: Nullable<string>;
};

export interface UnarchiveLixiCommand {
  id: number;
  mnemonic: string;
  mnemonicHash: string;
};

export interface ArchiveLixiCommand {
  id: number;
  mnemonic: string;
  mnemonicHash: string;
};

export interface WithdrawLixiCommand {
  id: number;
  mnemonic: string;
  mnemonicHash: string;
};

export interface RenameLixiCommand {
  id: number;
  mnemonic: string;
  mnemonicHash: string;
  name: string;
};

export interface ExportLixiCommand {
  id: number;
  mnemonicHash: string;
}

export interface UpdateLixiStatusCommand {
  id: number;
  mnemonicHash: string;
  status: string;
}

export enum LixiType {
  Random = 0,
  Fixed = 1,
  Divided = 2,
  Equal = 3,
};

export enum ClaimType {
  Single = 0,
  OneTime = 1,
};

export interface PostLixiResponseDto {
  lixi: Lixi,
  jobId?: string
};