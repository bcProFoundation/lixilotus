import { Field, Float, InputType } from '@nestjs/graphql';
import { Decimal } from '@prisma/client/runtime/binary';
import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { GraphQLDecimal, transformToDecimal } from 'prisma-graphql-type-decimal';

@InputType()
export class CreateWorshipInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  worshipedPersonId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  templeId?: string;

  @Field(() => Float)
  @IsNotEmpty()
  worshipedAmount: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  location?: string;

  @Field(() => GraphQLDecimal, { nullable: true })
  @Type(() => Object)
  @IsOptional()
  @Transform(transformToDecimal)
  latitude?: Decimal;

  @Field(() => GraphQLDecimal, { nullable: true })
  @IsOptional()
  @Type(() => Object)
  @Transform(transformToDecimal)
  longitude?: Decimal;
}
