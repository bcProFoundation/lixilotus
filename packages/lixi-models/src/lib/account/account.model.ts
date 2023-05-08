import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

import { Page } from '../page';

@ObjectType()
export class Account {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => String)
  mnemonic: string;

  @Field(() => String)
  encryptedMnemonic: string;

  @Field(() => String)
  encryptedSecret: string;

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

  @Field(() => String)
  mnemonicHash: string;

  @Field(() => String)
  address: string;

  @Field(() => String)
  balance?: number;

  @Field(() => String)
  language?: string;

  @Field(() => Page, { nullable: true })
  page?: Page;

  @Field(() => Float)
  lotusBurnUp: number;

  @Field(() => Float)
  lotusBurnDown: number;

  @Field(() => Float)
  lotusBurnScore: number;
}
