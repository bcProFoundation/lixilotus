import { Field, ID, ObjectType } from '@nestjs/graphql';

import { City } from './city.model';
import { State } from './state.model';

@ObjectType()
export class Country {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => String)
  capital: string;

  @Field(() => [State])
  state: [string];

  @Field(() => [City])
  city: [string];
}
