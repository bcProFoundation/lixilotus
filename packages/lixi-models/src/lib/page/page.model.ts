import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { GraphQLDateTime } from 'graphql-scalars';

import { Account } from '../account';
import { Category } from '../category/';
import { PageMessageSession } from '../message';

@ObjectType()
export class Page {
  @Field(() => ID)
  id: string;

  @Field(() => Number)
  pageAccountId: number;

  @Field(() => Account)
  pageAccount: Account;

  @Field(() => String)
  name: string;

  @Field(() => Int, { nullable: true })
  categoryId: Nullable<number>;

  @Field(() => Category, { nullable: true })
  category: Nullable<Category>;

  @Field(() => String, { nullable: true })
  title: string;

  @Field(() => String)
  description: string;

  @Field(() => String, { nullable: true })
  avatar: string;

  @Field(() => String, { nullable: true })
  cover: string;

  @Field(() => Page, { nullable: true })
  parent?: Page;

  @IsOptional()
  @Field(() => String, { nullable: true })
  parentId?: Nullable<string>;

  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => String, { nullable: true })
  website?: string;

  @Field(() => Float)
  danaBurnUp: number;

  @Field(() => Float)
  danaBurnDown: number;

  @Field(() => Float)
  danaBurnScore: number;

  @Field(() => Float, { nullable: true, description: 'The sum of burn amount for every post on page' })
  totalBurnForPage?: number;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was created.'
  })
  createdAt: Date;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was last updated.'
  })
  updatedAt: Date;

  @Field(() => Number, { nullable: true })
  countryId?: Nullable<number>;

  @Field(() => String, { nullable: true })
  countryName?: Nullable<string>;

  @Field(() => Number, { nullable: true })
  stateId?: Nullable<number>;

  @Field(() => String, { nullable: true })
  stateName?: Nullable<string>;

  @Field(() => Number, { nullable: true })
  followersCount?: Nullable<number>;

  @Field(() => String, { nullable: true })
  encryptedMnemonic?: Nullable<string>;

  @Field(() => String, { nullable: true })
  salt?: Nullable<string>;

  @Field(() => String)
  createPostFee: string;

  @Field(() => String)
  createCommentFee: string;

  @Field(() => Float)
  totalPostsBurnUp: number;

  @Field(() => Float)
  totalPostsBurnDown: number;

  @Field(() => Float)
  totalPostsBurnScore: number;

  @Field(() => [PageMessageSession], { nullable: true })
  pageMessageSessions?: Nullable<PageMessageSession[]>;

  @Field(() => Float, { nullable: true })
  accessMessageFee?: Nullable<number>;

  @Field(() => Float, { nullable: true })
  minDanaForMessage?: Nullable<number>;

  @Field(() => Boolean, { nullable: true })
  followerFreeMessage?: Nullable<boolean>;

  constructor(partial: Partial<Page>) {
    Object.assign(this, partial);
  }
}
