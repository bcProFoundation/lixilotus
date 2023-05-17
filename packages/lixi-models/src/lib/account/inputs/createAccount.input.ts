import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateAccountInput {
  @Field(() => String)
  @IsNotEmpty()
  mnemonic: string;

  @Field(() => String)
  @IsNotEmpty()
  encryptedMnemonic: string;

  @Field(() => String)
  @IsNotEmpty()
  mnemonicHash: string;

  @Field(() => String)
  language: string;
}
