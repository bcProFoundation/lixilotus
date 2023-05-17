import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class ImportAccountInput {
  @Field(() => String)
  @IsNotEmpty()
  mnemonic: string;

  @Field(() => String, { nullable: true })
  mnemonicHash: string;

  @Field(() => String, { nullable: true })
  language: string;
}
