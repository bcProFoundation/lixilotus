import { Field, InputType, registerEnumType } from '@nestjs/graphql';

import { Order } from '../../../core';

export enum HashtagOrderField {
  id = 'id',
  danaBurnScore = 'danaBurnScore',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt'
}

registerEnumType(HashtagOrderField, {
  name: 'HashtagOrderField',
  description: 'Properties by which hashtag connections can be ordered.'
});

@InputType()
export class HashtagOrder extends Order {
  @Field(() => HashtagOrderField)
  field: HashtagOrderField;
}
