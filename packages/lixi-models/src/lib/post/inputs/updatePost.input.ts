import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class UpdatePostInput {
  @IsNotEmpty()
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  title: string;

  @IsNotEmpty()
  @Field(() => String)
  content: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  cover: string;
}
