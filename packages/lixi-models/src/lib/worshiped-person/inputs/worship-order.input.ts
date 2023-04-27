import { Field, InputType, registerEnumType } from '@nestjs/graphql';

import { Order } from '../../../core';

export enum WorshipOrderField {
  id = 'id',
  worshipedAmount = 'worshipedAmount',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt'
}

registerEnumType(WorshipOrderField, {
  name: 'WorshipOrderField',
  description: 'Properties by which worship connections can be ordered.'
});

@InputType()
export class WorshipOrder extends Order {
  @Field(() => WorshipOrderField)
  field: WorshipOrderField;
}
