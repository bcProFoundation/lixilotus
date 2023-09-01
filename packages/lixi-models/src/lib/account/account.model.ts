import { Field, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { GraphQLDateTime } from 'graphql-scalars';

import { Message, PageMessageSession } from '../message';
import { Page } from '../page';

@ObjectType()
export class Account {
  @Field(() => Number)
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

  @Field(() => String, { nullable: true })
  secondaryLanguage?: Nullable<string>;

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
  avatar?: Nullable<string>;

  @Field(() => String, { nullable: true })
  cover?: Nullable<string>;

  @Field(() => String, { nullable: true })
  description?: Nullable<string>;

  @Field(() => String, { nullable: true })
  website?: Nullable<string>;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  dayOfBirth?: Nullable<number>;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  monthOfBirth?: Nullable<number>;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  yearOfBirth?: Nullable<number>;

  @Field(() => String, { nullable: true })
  createCommentFee?: Nullable<string>;

  constructor(partial: Partial<Account>) {
    Object.assign(this, partial);
  }
}
