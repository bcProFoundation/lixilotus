import { Field, InputType, registerEnumType } from '@nestjs/graphql';

import { Order } from '../../../core';

export enum FollowAccountOrderField {
  id = 'id',
  followerAccountId = 'followerAccountId',
  followingAccountId = 'followingAccountId',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt'
}

registerEnumType(FollowAccountOrderField, {
  name: 'FollowAccountOrderField',
  description: 'Properties by which follow account connections can be ordered.'
});

@InputType()
export class FollowAccountOrder extends Order {
  @Field(() => FollowAccountOrderField)
  field: FollowAccountOrderField;
}
