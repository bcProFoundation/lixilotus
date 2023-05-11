import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType('DeleteFollowAccountInput')
export class DeleteFollowAccountInput {
  @Field(() => Number)
  @IsNotEmpty()
  followerAccountId: number;

  @Field(() => Number)
  @IsNotEmpty()
  followingAccountId: number;
}
