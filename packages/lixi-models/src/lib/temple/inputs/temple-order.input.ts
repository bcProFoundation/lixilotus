import { Field, InputType, registerEnumType } from '@nestjs/graphql';

import { Order } from '../../../core';

export enum TempleOrderField {
  id = 'id',
  totalWorshipAmount = 'totalWorshipAmount',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt'
}

registerEnumType(TempleOrderField, {
  name: 'TempleOrderField',
  description: 'Properties by which temple connections can be ordered.'
});

@InputType()
export class TempleOrder extends Order {
  @Field(() => TempleOrderField)
  field: TempleOrderField;
}
