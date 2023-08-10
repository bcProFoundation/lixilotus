import { Field, InputType, registerEnumType } from '@nestjs/graphql';

import { Order } from '../../../core';

export enum MessageSessionOrderField {
  id = 'id',
  sessionOpen = 'sessionOpen',
  lixiAmount = 'lixiAmount',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt'
}

registerEnumType(MessageSessionOrderField, {
  name: 'MessageSessionOrderField',
  description: 'Properties by which message session connections can be ordered.'
});

@InputType()
export class MessageSessionOrder extends Order {
  @Field(() => MessageSessionOrderField)
  field: MessageSessionOrderField;
}
