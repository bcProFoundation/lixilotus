import { Field, InputType, registerEnumType } from '@nestjs/graphql';

import { Order } from '../../../core';

export enum TokenOrderField {
  id = 'id',
  tokenId = 'tokenId',
  name = 'name',
  ticker = 'ticker',
  danaBurnUp = 'danaBurnUp',
  danaBurnDown = 'danaBurnDown',
  danaBurnScore = 'danaBurnScore',
  createdDate = 'createdDate'
}

registerEnumType(TokenOrderField, {
  name: 'TokenOrderField',
  description: 'Properties by which token connections can be ordered.'
});

@InputType()
export class TokenOrder extends Order {
  @Field(() => TokenOrderField)
  field: TokenOrderField;
}
