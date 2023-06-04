import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { GraphQLDateTime } from 'graphql-scalars';

import { Account } from '../account';
import { Category } from '../category/';

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

  @Field(() => String)
  categoryId: string;

  @Field(() => Category)
  category: Category;

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
  lotusBurnUp: number;

  @Field(() => Float)
  lotusBurnDown: number;

  @Field(() => Float)
  lotusBurnScore: number;

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

  @Field(() => String, { nullable: true })
  countryId?: string;

  @Field(() => String, { nullable: true })
  countryName?: string;

  @Field(() => String, { nullable: true })
  stateId?: string;

  @Field(() => String, { nullable: true })
  stateName?: string;

  @Field(() => Number, { nullable: true })
  followersCount?: number;

  @Field(() => String, { nullable: true })
  encryptedMnemonic?: string;

  @Field(() => String, { nullable: true })
  salt?: string;

  @Field(() => String)
  createPostFee: string;

  @Field(() => String)
  createCommentFee: string;
}
