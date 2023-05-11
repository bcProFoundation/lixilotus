import { Field, InputType, registerEnumType } from '@nestjs/graphql';

import { Order } from '../../../core';

export enum FollowPageOrderField {
  id = 'id',
  accountId = 'accountId',
  pageId = 'pageId',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt'
}

registerEnumType(FollowPageOrderField, {
  name: 'FollowPageOrderField',
  description: 'Properties by which follow page connections can be ordered.'
});

@InputType()
export class FollowPageOrder extends Order {
  @Field(() => FollowPageOrderField)
  field: FollowPageOrderField;
}
