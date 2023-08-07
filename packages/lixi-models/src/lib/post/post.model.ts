import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { GraphQLDateTime } from 'graphql-scalars';

import { Account } from '../account';
import { PostHashtag } from '../hashtag/postHashtag.model';
import { Page } from '../page';
import { Token } from '../token';
import { UploadDetail } from '../upload';

import { Repost } from './repost.model';

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
  danaBurnUp: number;

  @Field(() => Float)
  danaBurnDown: number;

  @Field(() => Float)
  danaBurnScore: number;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was created.'
  })
  createdAt: Date;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was last updated.'
  })
  updatedAt: Date;

  @Field(() => Number, { nullable: true })
  totalComments?: number;

  @Field(() => [PostHashtag], { nullable: true })
  postHashtags?: [PostHashtag];

  @Field(() => Boolean, { nullable: true })
  followPostOwner?: boolean;

  @Field(() => Boolean, { nullable: true })
  followedPage?: boolean;

  @Field(() => Number, { nullable: true })
  repostCount?: number;

  @Field(() => [Repost], { nullable: true })
  reposts?: [Repost];

  @Field(() => String, { nullable: true })
  originalLanguage?: string;

  @Field(() => [PostTranslation], { nullable: true })
  translations?: [PostTranslation];
}

@ObjectType()
export class PostTranslation {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  translateContent: string;

  @Field(() => String)
  translateLanguage: string;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was created.'
  })
  createdAt: Date;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was last updated.'
  })
  updatedAt: Date;
}
