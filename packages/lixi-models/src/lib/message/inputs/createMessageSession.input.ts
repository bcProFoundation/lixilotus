import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateMessageSessionInput {
  @Field(() => String)
  @IsNotEmpty()
  pageMessageSessionId: string;
}
