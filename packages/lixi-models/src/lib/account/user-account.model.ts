import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';

@ObjectType()
export class UserAccount {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field()
  address: string;

  @Field()
  @Exclude()
  publicKey: string;

  @Field(() => Date, {
    description: 'Identifies the date and time when the object was created.'
  })
  createdAt: Date;

  @Field(() => Date, {
    description: 'Identifies the date and time when the object was last updated.'
  })
  updatedAt: Date;
}
