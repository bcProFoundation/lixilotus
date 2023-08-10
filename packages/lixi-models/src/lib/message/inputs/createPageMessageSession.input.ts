import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreatePageMessageInput {
  @Field(() => String)
  @IsNotEmpty()
  pageId: string;

  @Field(() => Number)
  @IsNotEmpty()
  accountId: number;

  @Field(() => Number, { nullable: true })
  lixiId?: number;

  @Field(() => String, { nullable: true })
  accountSecret?: string;
}
