export class Burn {
  txid: string;
}

export enum BurnType {
  Up = 1,
  Down = 0
};

export enum BurnForType {
  Page = 0x5f01,
  Post = 0x5f02,
  Comment = 0x5f03,
  Account = 0x5f04,
  Token = 0x5f05
};