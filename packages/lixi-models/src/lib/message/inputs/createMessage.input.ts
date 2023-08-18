import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class CreateMessageInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  body?: string;

  @Field(() => Number)
  @IsNotEmpty()
  authorId: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isPageOwner?: boolean;

  @Field(() => String, { nullable: true })
  pageMessageSessionId?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  tipHex?: string;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  uploadIds?: [string];
}
