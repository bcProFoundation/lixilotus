import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

import { Account } from '../account';
import { Post } from '../post';

@ObjectType()
export class Comment {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  content: string;

  @IsOptional()
  @Field(() => Number, { nullable: true })
  commentAccountId?: Nullable<number>;

  @IsOptional()
  @Field(() => Account, { nullable: true })
  commentAccount?: Nullable<Account>;

  @IsOptional()
  @Field(() => String, { nullable: true })
  commentByPublicKey?: Nullable<string>;

  @Field(() => String)
  commentToId: string;

  @Field(() => Post)
  commentTo: Post;

  @Field(() => String)
  commentText: string;

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
