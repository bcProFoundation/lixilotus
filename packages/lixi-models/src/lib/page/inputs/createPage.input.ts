import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class CreatePageInput {
  @Field(() => String)
  @IsNotEmpty()
  name: string;

  @Field(() => String)
  @IsNotEmpty()
  category: string;

  @Field(() => String)
  description: string;
  @Field(() => String)
  title?: string;

  @Field(() => String, { nullable: true })
  avatar?: string;

  @Field(() => String, { nullable: true })
  cover?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  parentId?: string;

  @Field(() => String)
  website: string;

  @Field(() => String)
  country?: string;

  @Field(() => String)
  state?: string;

  @Field(() => String)
  address?: string;
}
