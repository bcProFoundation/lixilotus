import { IsNotEmpty } from 'class-validator';

import { BurnForType, BurnType } from './burn.model';

export class BurnCommand {
  @IsNotEmpty()
  txHex: string;

  @IsNotEmpty()
  burnType: BurnType;

  @IsNotEmpty()
  burnForType: BurnForType;

  @IsNotEmpty()
  burnedBy: string;

  @IsNotEmpty()
  burnForId: string;

  @IsNotEmpty()
  burnValue: string;

  postQueryTag?: string;

  pageId?: string;

  tokenId?: string;

  tipToAddresses?: { address: string; amount: string }[];

  // Params to patch rtk query data
  queryParams?: any;
}

export class BurnQueueCommand {
  @IsNotEmpty()
  burnType: BurnType;

  @IsNotEmpty()
  burnForType: BurnForType;

  @IsNotEmpty()
  burnedBy: string;

  @IsNotEmpty()
  burnForId: string;

  @IsNotEmpty()
  burnValue: string;

  defaultFee: number;

  postQueryTag?: string;

  minBurnFilter?: number;

  pageId?: string;

  tokenId?: string;

  userId?: string;

  tipToAddresses?: { address: string; amount: string }[];
  // Params to patch rtk query data
  queryParams?: any;
}
