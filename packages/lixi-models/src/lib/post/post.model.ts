import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

import { Account } from '../account';
import { Page } from '../page';

@ObjectType()
export class Post {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  content: string;

  @Field(() => Number)
  postAccountId: number;

  @Field(() => Account)
  postAccount: Account;

  @Field(() => Number)
  pageAccountId?: number;

  @Field(() => Account)
  pageAccount?: Account;

  @Field(() => [String], { nullable: true })
  uploadCovers: [string];

  @Field(() => Page, { nullable: true })
  page?: Page;

  @IsOptional()
  @Field(() => String, { nullable: true })
  pageId?: Nullable<string>;

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
}
