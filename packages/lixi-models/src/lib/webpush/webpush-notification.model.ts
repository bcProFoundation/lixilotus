import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class WebpushNotification {
  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => String, { nullable: true })
  icon?: string;

  @Field(() => String, { nullable: true })
  url?: string;

  @Field(() => Number, { nullable: true })
  senderId?: number;

  @Field(() => String, { nullable: true })
  senderName?: string;

  @Field(() => Number, { nullable: true })
  recipientId?: number;
}
