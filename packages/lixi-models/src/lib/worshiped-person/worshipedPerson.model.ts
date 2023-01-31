import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

import { City } from '../geo-location/city.model';
import { Country } from '../geo-location/country.model';
import { State } from '../geo-location/state.model';
import { UploadDetail } from '../upload';

@ObjectType()
export class WorshipedPerson {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => UploadDetail, { nullable: true })
  avatar: UploadDetail;

  @Field(() => String, { nullable: true })
  @IsOptional()
  quote?: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  dateOfBirth?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  dateOfDeath?: Date;

  @Field(() => Country, { nullable: true })
  @IsOptional()
  country?: Country;

  @Field(() => State, { nullable: true })
  @IsOptional()
  state?: State;

  @Field(() => City, { nullable: true })
  @IsOptional()
  city?: City;
}
