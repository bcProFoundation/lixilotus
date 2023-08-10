import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';

import { Account } from '../account';

import { PageMessageSession } from './pageMessageSession.model';

@ObjectType()
export class Message {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  body: string;

  @Field(() => PageMessageSession, { nullable: true })
  pageMessageSession?: PageMessageSession;

  @Field(() => Account)
  author: Account;

  @Field(() => Boolean, { nullable: true })
  isPageOwner?: boolean;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was created.',
    nullable: true
  })
  createdAt?: Date;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was last updated.',
    nullable: true
  })
  updatedAt?: Date;
}
