import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';

import { Post } from '../post';

import { Hashtag } from './hashtag.model';

@ObjectType()
export class PostHashtag {
  @Field(() => ID)
  id: string;

  @Field(() => Hashtag)
  hashtag: Hashtag;

  @Field(() => String)
  hashtagId: string;

  @Field(() => Post, { nullable: true })
  post?: Post;

  @Field(() => String, { nullable: true })
  postId?: string;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was created.',
    nullable: true
  })
  createdAt?: Date;

  @Field(() => GraphQLDateTime, {
    description: 'Identifies the date and time when the object was last updated.',
    nullable: true
  })
  updatedAt?: Date;
}
