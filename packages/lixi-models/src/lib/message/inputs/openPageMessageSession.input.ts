import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class OpenPageMessageSessionInput {
  @Field(() => String)
  @IsNotEmpty()
  pageMessageSessionId: string;
}
