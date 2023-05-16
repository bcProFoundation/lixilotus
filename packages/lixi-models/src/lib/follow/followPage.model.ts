import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

import { Account } from '../account';
import { Page } from '../page';

@ObjectType()
export class FollowPage {
  @Field(() => ID, { nullable: true })
  id: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  accountId: number;

  @Field(() => Account, { nullable: true })
  @IsOptional()
  account: Account;

  @Field(() => String, { nullable: true })
  @IsOptional()
  pageId: string;

  @Field(() => Page, { nullable: true })
  @IsOptional()
  page: Page;

  @Field(() => Boolean, { nullable: true })
  isFollowed: boolean;

  @Field(() => Date, {
    description: 'Identifies the date and time when the object was created.'
  })
  createdAt: Date;

  @Field(() => Date, {
    description: 'Identifies the date and time when the object was last updated.'
  })
  updatedAt: Date;
}
