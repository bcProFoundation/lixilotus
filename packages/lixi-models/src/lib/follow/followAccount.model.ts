import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

import { Account } from '../account';

@ObjectType()
export class FollowAccount {
  @Field(() => ID, { nullable: true })
  id: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  followerAccountId: number;

  @Field(() => Account, { nullable: true })
  @IsOptional()
  followerAccount: Account;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  followingAccountId: number;

  @Field(() => Account, { nullable: true })
  @IsOptional()
  followingAccount: Account;

  @Field(() => Date, {
    description: 'Identifies the date and time when the object was created.'
  })
  createdAt: Date;

  @Field(() => Date, {
    description: 'Identifies the date and time when the object was last updated.'
  })
  updatedAt: Date;
}
