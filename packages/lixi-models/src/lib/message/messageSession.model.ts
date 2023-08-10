import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';

import { LixiModel } from '../lixi/lixi.model';

import { Message } from './message.model';
import { PageMessageSession } from './pageMessageSession.model';

@ObjectType()
export class MessageSession {
  @Field(() => ID)
  id: string;

  @Field(() => [Message])
  messages: [Message];

  @Field(() => PageMessageSession, { nullable: true })
  pageMessageSession?: PageMessageSession;

  @Field(() => LixiModel, { nullable: true })
  lixi?: LixiModel;

  @Field(() => Number, { nullable: true })
  lixiAmount?: number;

  @Field(() => Boolean, { nullable: true })
  sessionOpen?: boolean;

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
