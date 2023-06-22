import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class RepostInput {
  @Field(() => Number)
  @IsNotEmpty()
  accountId: number;

  @Field(() => String)
  @IsNotEmpty()
  postId: string;

  @Field(() => String, { nullable: true })
  @IsNotEmpty()
  txHex?: Nullable<string>;
}
