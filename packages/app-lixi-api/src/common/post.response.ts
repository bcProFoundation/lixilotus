import { ObjectType } from '@nestjs/graphql';
import relayTypes from './relay.types';
import { Post } from '@bcpros/lixi-models';

// TODO: Refactor this
@ObjectType()
export default class PostResponse extends relayTypes<Post>(Post) {}
