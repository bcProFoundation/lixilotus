import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

import { PostHashtag } from './postHashtag.model';

@ObjectType()
export class Hashtag {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  content: string;

  @Field(() => [PostHashtag], { nullable: true })
  postHashtags?: [PostHashtag];

  @Field(() => Float)
  lotusBurnUp: number;

  @Field(() => Float)
  lotusBurnDown: number;

  @Field(() => Float)
  lotusBurnScore: number;

  @Field(() => Date, {
    description: 'Identifies the date and time when the object was created.',
    nullable: true
  })
  createdAt?: Date;

  @Field(() => Date, {
    description: 'Identifies the date and time when the object was last updated.',
    nullable: true
  })
  updatedAt?: Date;
}
