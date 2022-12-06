import { Field, InputType, registerEnumType } from '@nestjs/graphql';

import { Order } from '../../../core';

export enum PageOrderField {
  id = 'id',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  name = 'name',
  title = 'title',
  lotusBurnScore = 'lotusBurnScore'
}

registerEnumType(PageOrderField, {
  name: 'PageOrderField',
  description: 'Properties by which page connections can be ordered.'
});

@InputType()
export class PageOrder extends Order {
  @Field(() => PageOrderField)
  field: PageOrderField;
}
