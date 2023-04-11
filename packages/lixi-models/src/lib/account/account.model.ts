import { Field, ID, ObjectType } from '@nestjs/graphql';

import { Page } from '../page';

@ObjectType()
export class Account {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  name: string;

  mnemonic: string;
  encryptedMnemonic: string;
  encryptedSecret: string;
  secret?: string;
  createdAt?: Date;
  updatedAt?: Date;
  mnemonicHash: string;

  @Field(() => String)
  address: string;

  balance?: number;
  language?: string;

  page?: Nullable<Page>;
}
