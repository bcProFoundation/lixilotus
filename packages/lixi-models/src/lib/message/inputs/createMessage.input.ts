import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class CreateMessageInput {
  @Field(() => String)
  @IsNotEmpty()
  body: string;

  @Field(() => Number)
  @IsNotEmpty()
  authorId: number;

  @Field(() => Boolean, { nullable: true })
  @IsNotEmpty()
  @IsOptional()
  isPageOwner?: boolean;

  @Field(() => String, { nullable: true })
  pageMessageSessionId?: string;
}
