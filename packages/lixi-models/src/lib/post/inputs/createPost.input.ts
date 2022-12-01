import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
@InputType()
export class CreatePostInput {
  @Field(() => String)
  @IsNotEmpty()
  content: string;

  @Field(() => Number, { nullable: true })
  pageAccountId?: number;

  @IsOptional()
  @Field(() => String, { nullable: true })
  pageId?: Nullable<string>;

  @IsOptional()
  @Field(() => String, { nullable: true })
  tokenId?: Nullable<string>;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  uploadCovers: [string];
}
