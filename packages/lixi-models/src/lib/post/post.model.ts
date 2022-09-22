import { Field, ID, ObjectType } from '@nestjs/graphql';
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
  pageAccountId: number;

  pageAccount: Account;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  cover: string;

  @Field(() => Page, { nullable: true })
  page?: Page;

  @IsOptional()
  @Field(() => String, { nullable: true })
  pageId?: Nullable<string>;

  @Field(() => Date, {
    description: 'Identifies the date and time when the object was created.'
  })
  createdAt: Date;

  @Field(() => Date, {
    description: 'Identifies the date and time when the object was last updated.'
  })
  updatedAt: Date;
}
