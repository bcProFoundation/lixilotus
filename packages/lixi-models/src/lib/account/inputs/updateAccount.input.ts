import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateAccountInput {
  @Field(() => ID)
  id: number;

  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => String, { nullable: true })
  language?: string;

  @Field(() => String, { nullable: true })
  avatar?: string;

  @Field(() => String, { nullable: true })
  cover?: string;
}
