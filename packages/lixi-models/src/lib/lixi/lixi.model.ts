import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';

import { PageMessageSession } from '../message';

@ObjectType()
export class LixiModel {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => Number)
  maxClaim: number;

  @Field(() => Number)
  claimedNum: number;

  @Field(() => Number)
  claimType: number;

  @Field(() => Number)
  lixiType: number;

  @Field(() => String, { nullable: true })
  claimCode?: string;

  @Field(() => Number)
  minValue: number;

  @Field(() => Number)
  maxValue: number;

  @Field(() => Number)
  fixedValue: number;

  @Field(() => Number)
  dividedValue: number;

  @Field(() => String)
  encryptedClaimCode: string;

  @Field(() => Number)
  totalClaim: number;

  @Field(() => Number)
  minStaking: number;

  @Field(() => String, { nullable: true })
  country?: string;

  @Field(() => String, { nullable: true })
  networkType?: string;

  @Field(() => Boolean)
  isFamilyFriendly: boolean;

  @Field(() => Number, { nullable: true })
  balance?: number;

  @Field(() => String)
  address: string;

  @Field(() => String)
  status: string;

  @Field(() => String)
  inventoryStatus: string;

  @Field(() => Number)
  accountId: number;

  @Field(() => String)
  amount: number;

  @Field(() => Number, { nullable: true })
  numberOfSubLixi?: number;

  @Field(() => Number, { nullable: true })
  parentId?: number;

  @Field(() => Boolean, { nullable: true })
  isClaimed?: boolean;

  @Field(() => EnvelopeModel, { nullable: true })
  envelope?: EnvelopeModel; //Envelop

  @Field(() => Number, { nullable: true })
  envelopeId?: number;

  @Field(() => String, { nullable: true })
  envelopeMessage?: string;

  @Field(() => Number, { nullable: true })
  subLixiTotalClaim?: number;

  @Field(() => Number, { nullable: true })
  subLixiBalance?: number;

  @Field(() => Boolean)
  isNFTEnabled: boolean;

  @Field(() => Number, { nullable: true })
  numberLixiPerPackage?: number;

  @Field(() => Number, { nullable: true })
  packageId?: number;

  @Field(() => Boolean)
  joinLotteryProgram: boolean;

  @Field(() => [DistributionModel], { nullable: true })
  distributions?: [DistributionModel];

  @Field(() => PageMessageSession, { nullable: true })
  pageMessageSession?: PageMessageSession;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was expired.',
    nullable: true
  })
  expiryAt?: Date;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was activated.',
    nullable: true
  })
  activationAt?: Date;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was created.',
    nullable: true
  })
  createdAt?: Date;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was last updated.',
    nullable: true
  })
  updatedAt?: Date;
}

@ObjectType()
export class DistributionModel {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  address: string;

  @Field(() => String)
  distributionType: string;

  @Field(() => Number)
  lixiId: number;
}

@ObjectType()
export class EnvelopeModel {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => String)
  thumbnail: string;

  @Field(() => String)
  image: string;

  @Field(() => String)
  slug: string;

  @Field(() => String)
  description: string;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was created.',
    nullable: true
  })
  createdAt?: Date;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was last updated.',
    nullable: true
  })
  updatedAt?: Date;
}
