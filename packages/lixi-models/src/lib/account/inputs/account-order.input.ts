import { Field, InputType, registerEnumType } from '@nestjs/graphql';

import { Order } from '../../../core';

export enum AccountOrderField {
  id = 'id',
  name = 'name',
  address = 'address',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt'
}

registerEnumType(AccountOrderField, {
  name: 'AccountOrderField',
  description: 'Properties by which account connections can be ordered.'
});

@InputType()
export class AccountOrder extends Order {
  @Field(() => AccountOrderField)
  field: AccountOrderField;
}
