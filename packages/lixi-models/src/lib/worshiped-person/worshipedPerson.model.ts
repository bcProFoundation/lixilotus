import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { GraphQLDateTime } from 'graphql-scalars';

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
  avatar?: UploadDetail;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  totalWorshipAmount?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  quote?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  wikiAvatar?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  countryOfCitizenship?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  achievement?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  bio?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  alias?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  religion?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  placeOfBirth?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  placeOfDeath?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  placeOfBurial?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  wikiDataId?: string;

  @Field(() => GraphQLDateTime, { nullable: true })
  @IsOptional()
  dateOfBirth?: Date;

  @Field(() => GraphQLDateTime, { nullable: true })
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

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was created.',
    nullable: true
  })
  createdAt?: Date;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was last updated.',
    nullable: true
  })
  updatedAt?: Date;
}
