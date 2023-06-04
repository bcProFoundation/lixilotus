import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';

import { Account } from '../account';

export interface WebpushSubscription {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}

@ObjectType()
export class WebpushSubscriber {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  clientAppId: string;

  @Field(() => String)
  auth: string;

  @Field(() => String)
  p256dh: string;

  @Field(() => String)
  endpoint: string;

  @Field(() => String)
  deviceId: string;

  @Field(() => Number)
  accountId: number;

  @Field(() => Account)
  account: Account;

  @Field(() => Number)
  address: string;

  @Field(() => GraphQLDateTime, { nullable: true })
  expirationTime?: Date;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was created.'
  })
  createdAt: Date;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was last updated.'
  })
  updatedAt: Date;
}
