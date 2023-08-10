import { Field, InputType, registerEnumType } from '@nestjs/graphql';

import { Order } from '../../../core';

export enum MessageOrderField {
  id = 'id',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt'
}

registerEnumType(MessageOrderField, {
  name: 'MessageOrderField',
  description: 'Properties by which message connections can be ordered.'
});

@InputType()
export class MessageOrder extends Order {
  @Field(() => MessageOrderField)
  field: MessageOrderField;
}
