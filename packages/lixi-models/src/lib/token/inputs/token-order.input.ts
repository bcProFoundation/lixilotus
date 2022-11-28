import { Field, InputType, registerEnumType } from '@nestjs/graphql';

import { Order } from '../../../core';

export enum TokenOrderField {
  id = 'id',
  createdDate = 'createdAt'
}

registerEnumType(TokenOrderField, {
  name: 'TokenOrderField',
  description: 'Properties by which token connections can be ordered.'
});

@InputType()
export class TokentOrder extends Order {
  @Field(() => TokenOrderField)
  field: TokenOrderField;
}
