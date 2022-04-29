import { Account, CreateLixiCommand, Lixi, WithdrawLixiCommand } from "@bcpros/lixi-models";

export interface MapEncryptedClaimCode {
  [xpriv: string]: string
};

export interface CreateSubLixiesJobData {
  parentId: number;
  command: CreateLixiCommand;
};

export interface CreateSubLixiesResult {
  id: number;
}

export interface CreateSubLixiesChunkJobData extends CreateSubLixiesJobData {
  numberOfSubLixiInChunk: number;
  startDerivationIndexForChunk: number;
  xpiAllowance: number;
  temporaryFeeCalc: number;
  fundingAddress: string;
  accountSecret: string;
};
export interface ExportSubLixiesJobData {
  parentId: number;
  secret: string;
};

export interface WithdrawSubLixiesJobData {
  parentId: number;
  mnemonic: string;
  accountAddress: string;
};
