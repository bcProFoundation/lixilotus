import { Field, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { GraphQLDateTime } from 'graphql-scalars';

@InputType()
export class UpdateAccountInput {
  @Field(() => Number)
  id: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  name: string;

  @Field(() => String, { nullable: true })
  language?: string;

  @Field(() => String, { nullable: true })
  avatar?: string;

  @Field(() => String, { nullable: true })
  cover?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  website?: string;

  @Field(() => GraphQLDateTime, { nullable: true })
  @IsOptional()
  birthday?: Date;

  @Field(() => String, { nullable: true })
  createCommentFee?: string;
}
