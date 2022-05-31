import { Account, CreateLixiCommand, Lixi, Package, WithdrawLixiCommand } from "@bcpros/lixi-models";

export interface MapEncryptedClaimCode {
  [xpriv: string]: string
};

export interface CreateSubLixiesJobData {
  parentId: number;
  command: CreateLixiCommand;
};

export interface CreateSubLixiesJobResult {
  id: number;
  name: string;
  jobName: string;
  mnemonicHash: string;
  senderId: number;
  recipientId: number;
}

export interface CreateSubLixiesChunkJobData extends CreateSubLixiesJobData {
  numberOfSubLixiInChunk: number;
  startDerivationIndexForChunk: number;
  xpiAllowance: number;
  temporaryFeeCalc: number;
  fundingAddress: string;
  accountSecret: string;
  packageId?: Nullable<number>;
};
export interface ExportSubLixiesJobData {
  parentId: number;
  secret: string;
};

export interface ExportSubLixiesJobResult {
  id: number;
  name: string;
  jobName: string;
  path: string;
  mnemonicHash: string;
  senderId: number;
  recipientId: number;
  fileName: string;
  parentId: number;
}

export interface WithdrawSubLixiesJobData {
  parentId: number;
  mnemonic: string;
  accountAddress: string;
};

export interface WithdrawSubLixiesJobResult {
  id: number;
  name: string;
  jobName: string;
  mnemonicHash: string;
  senderId: number;
  recipientId: number;
}
