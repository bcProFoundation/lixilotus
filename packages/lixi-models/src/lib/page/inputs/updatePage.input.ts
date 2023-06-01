import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class UpdatePageInput {
  @IsNotEmpty()
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  title: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => String, { nullable: true })
  categoryId: string;

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
  countryId?: string;

  @Field(() => String, { nullable: true })
  stateId?: string;

  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => String, { nullable: true })
  createPostFee: string;

  @Field(() => String, { nullable: true })
  createCommentFee: string;
}
