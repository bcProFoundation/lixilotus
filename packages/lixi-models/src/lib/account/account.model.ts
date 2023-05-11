import { Field, ID, ObjectType } from '@nestjs/graphql';

import { FollowAccount, FollowPage } from '../follow';
import { Page } from '../page';

@ObjectType()
export class Account {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  name: string;

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

  @Field(() => Date, {
    description: 'Identifies the date and time when the object was created.'
  })
  createdAt?: Date;

  @Field(() => Date, {
    description: 'Identifies the date and time when the object was last updated.'
  })
  updatedAt?: Date;

  @Field(() => String, { nullable: true })
  mnemonicHash?: string;

  @Field(() => String)
  address: string;

  @Field(() => String)
  language?: string;

  @Field(() => Page, { nullable: true })
  page?: Page;

  @Field(() => Boolean, { nullable: true })
  isFollow?: boolean;

  @Field(() => FollowAccount, { nullable: true })
  follower?: FollowAccount;

  @Field(() => FollowAccount, { nullable: true })
  following?: FollowAccount;

  @Field(() => FollowPage, { nullable: true })
  followingPage?: FollowPage;
}
