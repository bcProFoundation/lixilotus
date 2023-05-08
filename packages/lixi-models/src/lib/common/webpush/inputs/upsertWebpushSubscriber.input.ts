import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class UpsertWebpushSubscriberInput {
  @Field(() => Number)
  @IsOptional()
  accountId: number;

  @Field(() => String)
  @IsNotEmpty()
  address: string;

  @Field(() => String)
  @IsNotEmpty()
  publicKey: string;

  @Field(() => String)
  @IsNotEmpty()
  signature: string;
}
