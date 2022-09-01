import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class UpdatePageInput {
  @IsNotEmpty()
  @Field(() => ID)
  id: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  name: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  avatar?: string;

  @Field(() => String, { nullable: true })
  cover?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  parentId?: string;

  @Field(() => String, { nullable: true })
  website: string;

  @Field(() => String, { nullable: true })
  country?: string;

  @Field(() => String, { nullable: true })
  state?: string;

  @Field(() => String, { nullable: true })
  address?: string;
}