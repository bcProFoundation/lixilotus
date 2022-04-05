import { CreateLixiCommand } from "@bcpros/lixi-models";

export interface MapEncryptedClaimCode {
  [xpriv: string]: string
};

export interface CreateSubLixiesJobData {
  parentId: number;
  command: CreateLixiCommand;
};

export interface CreateSubLixiesChunkJobData extends CreateSubLixiesJobData {
  numberOfSubLixiInChunk: number;
  startDerivationIndexForChunk: number;
  xpiAllowance: number;
  temporaryFeeCalc: number;
  fundingAddress: string;
};