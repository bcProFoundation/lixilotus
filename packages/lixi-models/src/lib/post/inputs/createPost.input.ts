import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
@InputType()
export class CreatePostInput {
  @Field(() => String)
  @IsNotEmpty()
  htmlContent: string;

  @Field(() => String)
  @IsNotEmpty()
  pureContent: string;

  @Field(() => Number, { nullable: true })
  pageAccountId?: number;

  @IsOptional()
  @Field(() => String, { nullable: true })
  pageId?: Nullable<string>;

  @IsOptional()
  @Field(() => String, { nullable: true })
  tokenPrimaryId?: Nullable<string>;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  uploadCovers: [string];

  @IsOptional()
  @Field(() => String, { nullable: true })
  txHex?: Nullable<string>;
}
