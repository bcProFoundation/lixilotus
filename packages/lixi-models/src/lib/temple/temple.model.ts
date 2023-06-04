import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { GraphQLDateTime } from 'graphql-scalars';

import { Account } from '../account';
import { City } from '../geo-location/city.model';
import { Country } from '../geo-location/country.model';
import { State } from '../geo-location/state.model';
import { UploadDetail } from '../upload';

@ObjectType()
export class Temple {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => Account)
  account: Account;

  @Field(() => UploadDetail, { nullable: true })
  avatar?: UploadDetail;

  @Field(() => UploadDetail, { nullable: true })
  cover?: UploadDetail;

  @Field(() => String, { nullable: true })
  @IsOptional()
  achievement?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  alias?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  religion?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  address?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  president?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  website?: string;

  @Field(() => Boolean)
  verified: boolean;

  @Field(() => GraphQLDateTime, { nullable: true })
  @IsOptional()
  dateOfCompleted?: Date;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  totalWorshipAmount?: number;

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
