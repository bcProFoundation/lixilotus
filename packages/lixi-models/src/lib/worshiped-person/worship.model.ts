import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { Decimal } from '@prisma/client/runtime';
import { Transform, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { GraphQLDecimal, transformToDecimal } from 'prisma-graphql-type-decimal';

import { Account } from '../account';

import { WorshipedPerson } from './worshipedPerson.model';

@ObjectType()
export class Worship {
  @Field(() => ID)
  id: string;

  @Field(() => Account)
  account: Account;

  @Field(() => WorshipedPerson)
  worshipedPerson: WorshipedPerson;

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
}