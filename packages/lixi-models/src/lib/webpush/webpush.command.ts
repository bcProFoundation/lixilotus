import { Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { GraphQLDateTime } from 'graphql-scalars';

export class WebpushSubscriberCommand {
  @Field(() => Number)
  @IsOptional()
  accountId: number;

  @Field(() => String)
  @IsNotEmpty()
  address: string;

  @Field(() => String)
  @IsNotEmpty()
  legacyAddress: string;

  @Field(() => GraphQLDateTime, { nullable: true })
  @IsOptional()
  expirationTime?: Date;

  @Field(() => String)
  @IsNotEmpty()
  signature: string;
}

export class WebpushSubscribeCommand {
  @Field(() => [WebpushSubscriberCommand])
  @IsNotEmpty()
  subscribers?: WebpushSubscriberCommand[];

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

export class WebpushUnsubscribeCommand {
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

  @Field(() => [String])
  @IsNotEmpty()
  addresses: string[];
}
