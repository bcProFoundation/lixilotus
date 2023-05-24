import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { Transform, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { GraphQLDecimal, transformToDecimal } from 'prisma-graphql-type-decimal';

import { Account } from '../account';
import { Temple } from '../temple';

import { WorshipedPerson } from './worshipedPerson.model';
import { Decimal } from '@prisma/client/runtime/binary';

@ObjectType()
export class Worship {
  @Field(() => ID)
  id: string;

  @Field(() => Account)
  account: Account;

  @Field(() => WorshipedPerson, { nullable: true })
  @IsOptional()
  worshipedPerson?: WorshipedPerson;

  @Field(() => Temple, { nullable: true })
  @IsOptional()
  temple?: Temple;

  @Field(() => Float)
  worshipedAmount: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  location?: string;

  @Field(() => GraphQLDecimal, { nullable: true })
  @IsOptional()
  @Type(() => Object)
  @Transform(transformToDecimal)
  latitude?: Decimal;

  @Field(() => GraphQLDecimal, { nullable: true })
  @Type(() => Object)
  @IsOptional()
  @Transform(transformToDecimal)
  longitude?: Decimal;

  @Field(() => Date, {
    description: 'Identifies the date and time when the object was created.'
  })
  createdAt: Date;

  @Field(() => Date, {
    description: 'Identifies the date and time when the object was last updated.'
  })
  updatedAt: Date;
}
