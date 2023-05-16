import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateAccountInput {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => String, { nullable: true })
  language: string;

  @Field(() => String, { nullable: true })
  mnemonic: string;
}
