import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class DeleteFollowTokenInput {
  @Field(() => Number)
  @IsNotEmpty()
  accountId: number;

  @Field(() => String)
  @IsNotEmpty()
  tokenId: string;
}
