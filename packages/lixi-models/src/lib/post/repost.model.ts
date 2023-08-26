import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { GraphQLDateTime } from 'graphql-scalars';

import { Account } from '../account';

import { Post } from './post.model';

@ObjectType()
export class Repost {
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
  postId: string;

  @Field(() => Post, { nullable: true })
  @IsOptional()
  post: Post;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was created.'
  })
  createdAt: Date;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was last updated.'
  })
  updatedAt: Date;

  constructor(partial: Partial<Repost>) {
    Object.assign(this, partial);
  }
}
