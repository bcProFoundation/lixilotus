import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType('CreateFollowAccountInput')
export class CreateFollowAccountInput {
  @Field(() => Number)
  @IsNotEmpty()
  followerAccountId: number;

  @Field(() => Number)
  @IsNotEmpty()
  followingAccountId: number;
}
