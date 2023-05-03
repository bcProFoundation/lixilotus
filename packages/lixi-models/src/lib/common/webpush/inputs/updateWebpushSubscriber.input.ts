import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class UpdateWebpushSubscriberInput {
  @Field(() => ID)
  @IsNotEmpty()
  id?: string;

  @Field(() => String)
  @IsNotEmpty()
  clientAppId: string;

  @Field(() => String)
  @IsNotEmpty()
  auth: string;

  @Field(() => String)
  @IsNotEmpty()
  p256dh: string;

  @Field(() => String)
  @IsNotEmpty()
  endpoint: string;

  @Field(() => String)
  @IsNotEmpty()
  deviceId: string;

  @Field(() => Number)
  @IsNotEmpty()
  accountId: number;

  @Field(() => Number)
  address: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  lastModifiedAt?: Date;
}
