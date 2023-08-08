import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

import { ExtraArguments } from './createPost.input';
@InputType()
export class UpdatePostInput {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  @IsNotEmpty()
  pureContent: string;

  @Field(() => String)
  @IsNotEmpty()
  htmlContent: string;

  @IsOptional()
  @Field(() => ExtraArguments, { nullable: true })
  extraArguments?: ExtraArguments;

  //Will need later

  // @Field(() => Number, { nullable: true })
  // pageAccountId?: number;

  // @IsOptional()
  // @Field(() => String, { nullable: true })
  // pageId?: Nullable<string>;

  // @IsOptional()
  // @Field(() => String, { nullable: true })
  // tokenPrimaryId?: Nullable<string>;

  // @Field(() => [String], { nullable: true })
  // @IsOptional()
  // uploadCovers: [string];
}
