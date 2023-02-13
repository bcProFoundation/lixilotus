import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class CreateWorshipedPersonInput {
  @Field(() => String)
  @IsNotEmpty()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  avatar?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  quote?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  bio?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  wikiDataId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  dateOfBirth?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  dateOfDeath?: string;

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
