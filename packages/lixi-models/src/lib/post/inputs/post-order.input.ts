import { Field, InputType, registerEnumType } from '@nestjs/graphql';

import { Order } from '../../../core';

export enum PostOrderField {
  id = 'id',
  danaBurnScore = 'danaBurnScore',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  lastRepostAt = 'lastRepostAt',
  content = 'content'
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
