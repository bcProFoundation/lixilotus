import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class ClosePageMessageSessionInput {
  @Field(() => String)
  @IsNotEmpty()
  pageMessageSessionId: string;
}
