import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

import { Account } from '../account';
import { Page } from '../page';
import { Token } from '../token';
import { UploadDetail } from '../upload';

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

  @Field(() => String, { nullable: true })
  tokenId?: string;

  @Field(() => Token, { nullable: true })
  token?: Token;

  @Field(() => [UploadDetail], { nullable: true })
  uploads: [UploadDetail];

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

  @Field(() => Number, { nullable: true })
  totalComments?: number;
}
