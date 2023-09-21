import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';

import { Account } from '../account';
import { LixiModel } from '../lixi/lixi.model';
import { Page } from '../page';

import { Message } from './message.model';

@ObjectType()
export class PageMessageSession {
  @Field(() => ID)
  id: string;

  @Field(() => Page)
  page: Page;

  @Field(() => Account)
  account: Account;

  @Field(() => LixiModel, { nullable: true })
  lixi?: LixiModel;

  @Field(() => String, { nullable: true })
  lixiClaimCode?: string;

  @Field(() => [Message], { nullable: true })
  messages?: [Message];

  @Field(() => LatestMessage, { nullable: true })
  latestMessage?: LatestMessage;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the session was opened.',
    nullable: true
  })
  sessionOpenedAt?: Date;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the session was closed.',
    nullable: true
  })
  sessionClosedAt?: Date;

  @Field(() => PageMessageSessionStatus)
  status: PageMessageSessionStatus;

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

@ObjectType()
export class LatestMessage {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  body?: string;

  @Field(() => LatestMessageAuthor, { nullable: true })
  author?: LatestMessageAuthor;
}

@ObjectType()
export class LatestMessageAuthor {
  @Field(() => Number, { nullable: true })
  id?: number;

  @Field(() => String, { nullable: true })
  address?: string;
}

export enum PageMessageSessionStatus {
  PENDING = 'PENDING',
  OPEN = 'OPEN',
  CLOSE = 'CLOSE'
}

registerEnumType(PageMessageSessionStatus, {
  name: 'PageMessageSessionStatus',
  description: 'Properties by status of the current PageMessageSession.'
});
