import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

import { PostOrder } from './post-order.input';

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
  createFeeHex?: Nullable<string>;

  @IsOptional()
  @Field(() => ExtraArguments, { nullable: true })
  extraArguments?: ExtraArguments;
}

@InputType()
export class ExtraArguments {
  @IsOptional()
  @Field(() => Number, { nullable: true })
  minBurnFilter?: number;

  @IsOptional()
  @Field(() => String, { nullable: true })
  isTop?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  hashtagId?: string;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  hashtags?: [string];

  @IsOptional()
  @Field(() => String, { nullable: true })
  query?: string;

  @IsOptional()
  @Field(() => PostOrder, { nullable: true })
  orderBy?: PostOrder;
}
