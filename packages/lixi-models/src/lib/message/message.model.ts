import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';

import { Account } from '../account';
import { UploadDetail } from '../upload';

import { PageMessageSession } from './pageMessageSession.model';

@ObjectType()
export class Message {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  body?: string;

  @Field(() => PageMessageSession, { nullable: true })
  pageMessageSession?: PageMessageSession;

  @Field(() => Account)
  author: Account;

  @Field(() => Boolean, { nullable: true })
  isPageOwner?: boolean;

  @Field(() => [UploadDetail], { nullable: true })
  uploads?: [UploadDetail];

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

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE'
}

registerEnumType(MessageType, {
  name: 'MessageType',
  description: 'Properties by type of the message.'
});
