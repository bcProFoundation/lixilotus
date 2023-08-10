import { Field, InputType, registerEnumType } from '@nestjs/graphql';

import { Order } from '../../../core';

export enum PageMessageSessionOrderField {
  id = 'id',
  status = 'status',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt'
}

registerEnumType(PageMessageSessionOrderField, {
  name: 'PageMessageSessionOrderField',
  description: 'Properties by which page message session connections can be ordered.'
});

@InputType()
export class PageMessageSessionOrder extends Order {
  @Field(() => PageMessageSessionOrderField)
  field: PageMessageSessionOrderField;
}
