export class Burn {
  id: string;
  txid: string;
  burnType: BurnType;
  burnForType: BurnForType;
  burnedBy: string;
  burnForId: string;
  burnedValue: number;
}

export enum BurnType {
  Up = 1,
  Down = 0
}

export enum BurnForType {
  Page = 0x5f01,
  Post = 0x5f02,
  Comment = 0x5f03,
  Account = 0x5f04,
  Token = 0x5f05,
  Worship = 0x5f06
}
