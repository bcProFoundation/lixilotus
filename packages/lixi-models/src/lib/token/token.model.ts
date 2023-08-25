import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { GraphQLDateTime } from 'graphql-scalars';

@ObjectType()
export class Token {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  tokenId: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  ticker: string;

  @Field(() => String)
  tokenType: string;

  @Field(() => String, { nullable: true })
  tokenDocumentUrl: Nullable<string>;

  @Field(() => String, { nullable: true })
  totalBurned: Nullable<string>;

  @Field(() => String, { nullable: true })
  totalMinted: Nullable<string>;

  @Field(() => Number)
  decimals: number;

  @IsOptional()
  @Field(() => Float)
  danaBurnUp: number;

  @IsOptional()
  @Field(() => Float)
  danaBurnDown: number;

  @IsOptional()
  @Field(() => Float)
  danaBurnScore: number;

  @Field(() => String, { nullable: true })
  initialTokenQuantity: Nullable<string>;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was created.'
  })
  createdDate: Date;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was last comments.',
    nullable: true
  })
  comments?: Nullable<Date>;

  @Field(() => Number, { nullable: true })
  rank?: Nullable<number>;

  @Field(() => Boolean, { nullable: true })
  isFollowed?: Nullable<boolean>;

  constructor(partial: Partial<Token>) {
    Object.assign(this, partial);
  }
}
