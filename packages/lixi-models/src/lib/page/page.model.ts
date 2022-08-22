import { Field, ID, ObjectType } from '@nestjs/graphql';
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

  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;

  @Field(() => String, { nullable: true })
  avatar: string;

  @Field(() => String, { nullable: true })
  cover: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  parentId?: Nullable<string>;

  @Field(() => String)
  address: string;

  @Field(() => String)
  website: string;

  @Field(() => Date, {
    description: 'Identifies the date and time when the object was created.'
  })
  createdAt: Date;

  @Field(() => Date, {
    description: 'Identifies the date and time when the object was last updated.'
  })
  updatedAt: Date;
  country?: string;
  state?: string;
}
