import { IsNotEmpty } from 'class-validator';

import { WORSHIP_TYPES } from '../../constants';

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

  worshipType?: WORSHIP_TYPES;
}

export class BurnQueueCommand {
  txHex?: string;

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

  tipToAddresses?: { address: string; amount: string }[];

  worshipType?: WORSHIP_TYPES;

  extraArguments?: BurnExtraArguments;
}

export class BurnExtraArguments {
  isTop?: boolean;

  query?: string;

  hashtags?: string[];

  postQueryTag?: string;

  minBurnFilter?: number;

  pageId?: string;

  tokenId?: string;

  postId?: string;

  userId?: string;

  hashtagId?: string;

  orderBy?: any;
}
