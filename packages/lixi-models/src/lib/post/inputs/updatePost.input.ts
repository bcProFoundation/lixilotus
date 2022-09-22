import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class UpdatePostInput {
  @IsNotEmpty()
  @Field(() => ID)
  id: string;

  @Field(() => String)
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @Field(() => String)
  content: string;

  @IsNotEmpty()
  @Field(() => String)
  cover: string;
}
