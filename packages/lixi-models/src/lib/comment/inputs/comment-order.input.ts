import { Field, InputType, registerEnumType } from '@nestjs/graphql';

import { Order } from '../../../core';

export enum CommentOrderField {
  id = 'id',
  danaBurnScore = 'danaBurnScore',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt'
}

registerEnumType(CommentOrderField, {
  name: 'CommentOrderField',
  description: 'Properties by which comment connections can be ordered.'
});

@InputType()
export class CommentOrder extends Order {
  @Field(() => CommentOrderField)
  field: CommentOrderField;
}
