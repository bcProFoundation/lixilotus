import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Category {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => Date, {
    description: 'Identifies the date and time when the object was created.'
  })
  createdAt: Date;

  @Field(() => Date, {
    description: 'Identifies the date and time when the object was last updated.'
  })
  updatedAt: Date;
}
