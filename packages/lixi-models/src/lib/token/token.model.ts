import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

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
  tokenDocumentUrl: string;

  @Field(() => String, { nullable: true })
  totalBurned: string;

  @Field(() => String, { nullable: true })
  totalMinted: string;

  @Field(() => Number)
  decimals: number;

  @IsOptional()
  @Field(() => String, { nullable: true })
  lotusBurnUp?: Nullable<string>;

  @IsOptional()
  @Field(() => String, { nullable: true })
  lotusBurnDown?: string;

  @Field(() => String, { nullable: true })
  initialTokenQuantity: string;

  @Field(() => Date, {
    description: 'Identifies the date and time when the object was created.'
  })
  createdDate: Date;

  @Field(() => Date, {
    description: 'Identifies the date and time when the object was last comments.',
    nullable: true
  })
  comments?: Date;
}
