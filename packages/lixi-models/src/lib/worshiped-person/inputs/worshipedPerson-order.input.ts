import { Field, InputType, registerEnumType } from '@nestjs/graphql';

import { Order } from '../../../core';

export enum WorshipedPersonOrderField {
  id = 'id',
  totalWorshipAmount = 'totalWorshipAmount',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt'
}

registerEnumType(WorshipedPersonOrderField, {
  name: 'WorshipedPersonOrderField',
  description: 'Properties by which worshiped person connections can be ordered.'
});

@InputType()
export class WorshipedPersonOrder extends Order {
  @Field(() => WorshipedPersonOrderField)
  field: WorshipedPersonOrderField;
}
