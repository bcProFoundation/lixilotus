import { Field, ID, ObjectType } from '@nestjs/graphql';

import { City } from './city.model';
import { Country } from './country.model';

@ObjectType()
export class State {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => City)
  country: Country;

  @Field(() => [City])
  city: [string];
}
