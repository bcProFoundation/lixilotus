import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateWebpushSubscriberInput {
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
  @IsNotEmpty()
  address: string;
}
