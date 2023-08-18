import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { GraphQLDateTime } from 'graphql-scalars';

import { Message, PageMessageSession } from '../message';
import { Page } from '../page';

@ObjectType()
export class Account {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => Number)
  balance?: number;

  @Field(() => String, { nullable: true })
  mnemonic?: string;

  @Field(() => String, { nullable: true })
  encryptedMnemonic?: string;

  @Field(() => String, { nullable: true })
  encryptedSecret?: string;

  @Field(() => String, { nullable: true })
  secret?: string;

  @Field(() => String, { nullable: true })
  publicKey?: string;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was created.'
  })
  createdAt?: Date;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was last updated.'
  })
  updatedAt?: Date;

  @Field(() => String, { nullable: true })
  mnemonicHash?: string;

  @Field(() => String)
  address: string;

  @Field(() => String)
  language?: string;

  @Field(() => [Page], { nullable: true })
  pages?: [Page];

  @Field(() => Number, { nullable: true })
  followersCount?: number;

  @Field(() => Number, { nullable: true })
  followingsCount?: number;

  @Field(() => Number, { nullable: true })
  followingPagesCount?: number;

  @Field(() => [Message], { nullable: true })
  messages?: [Message];

  @Field(() => [PageMessageSession], { nullable: true })
  pageMessageSessions?: [PageMessageSession];

  @Field(() => String, { nullable: true })
  avatar?: string;

  @Field(() => String, { nullable: true })
  cover?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  website?: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  dayOfBirth?: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  monthOfBirth?: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  yearOfBirth?: number;

  @Field(() => String, { nullable: true })
  createCommentFee?: string;
}
