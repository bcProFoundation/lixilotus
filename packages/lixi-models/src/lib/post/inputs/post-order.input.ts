import { Field, InputType, registerEnumType } from '@nestjs/graphql';

import { Order } from '../../../core';

export enum PostOrderField {
  id = 'id',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  content = 'content',
  title = 'title'
}

registerEnumType(PostOrderField, {
  name: 'PostOrderField',
  description: 'Properties by which post connections can be ordered.'
});

@InputType()
export class PostOrder extends Order {
  @Field(() => PostOrderField)
  field: PostOrderField;
}
