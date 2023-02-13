import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateTokenInput {
  @Field(() => String)
  @IsNotEmpty()
  tokenId: string;
}
