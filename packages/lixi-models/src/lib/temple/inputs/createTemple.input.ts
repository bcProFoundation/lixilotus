import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { GraphQLDateTime } from 'graphql-scalars';

@InputType()
export class CreateTempleInput {
  @Field(() => String)
  @IsNotEmpty()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  avatar?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  cover?: string;

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

  @Field(() => GraphQLDateTime, { nullable: true })
  @IsOptional()
  dateOfCompleted?: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  countryId?: Nullable<string>;

  @Field(() => String, { nullable: true })
  @IsOptional()
  stateId?: Nullable<string>;

  @Field(() => String, { nullable: true })
  @IsOptional()
  cityId?: Nullable<string>;
}
