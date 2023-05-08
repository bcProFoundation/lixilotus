import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { UpsertWebpushSubscriberInput } from './upsertWebpushSubscriber.input';

@InputType()
export class WebpushSubscribeInput {
  @Field(() => [UpsertWebpushSubscriberInput])
  @IsNotEmpty()
  subscribers?: UpsertWebpushSubscriberInput;

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
}
