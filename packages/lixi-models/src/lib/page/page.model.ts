import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

import { Account } from '../account';

@ObjectType()
export class Page {
  @Field(() => ID)
  id: string;

  @Field(() => Number)
  pageAccountId: number;

  pageAccount: Account;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  categoryId: string;

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

  @Field(() => Date, {
    description: 'Identifies the date and time when the object was created.'
  })
  createdAt: Date;

  @Field(() => Date, {
    description: 'Identifies the date and time when the object was last updated.'
  })
  updatedAt: Date;

  @Field(() => String, { nullable: true })
  country?: string;

  @Field(() => String, { nullable: true })
  state?: string;
}
