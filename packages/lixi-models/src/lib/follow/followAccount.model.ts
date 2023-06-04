import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { GraphQLDateTime } from 'graphql-scalars';

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

  @Field(() => Boolean, { nullable: true })
  isFollowed: boolean;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was created.'
  })
  createdAt: Date;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was last updated.'
  })
  updatedAt: Date;
}
