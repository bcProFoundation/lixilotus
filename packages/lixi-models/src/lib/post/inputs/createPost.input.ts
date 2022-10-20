import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class CreatePostInput {
  @Field(() => String)
  @IsNotEmpty()
  content: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  pageId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  cover: string;
}
