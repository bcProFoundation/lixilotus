import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateFollowPageInput {
  @Field(() => Number)
  @IsNotEmpty()
  accountId: number;

  @Field(() => String)
  @IsNotEmpty()
  pageId: string;
}
