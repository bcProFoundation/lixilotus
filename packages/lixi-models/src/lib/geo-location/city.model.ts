import { Field, ID, ObjectType } from '@nestjs/graphql';

import { Country } from './country.model';
import { State } from './state.model';

@ObjectType()
export class City {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => Country)
  country: string;

  @Field(() => State)
  state: string;
}
