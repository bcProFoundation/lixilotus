import { ObjectType } from '@nestjs/graphql';
import relayTypes from './custom-graphql-relay/relay.types';
import { Post } from '@bcpros/lixi-models';

@ObjectType()
export default class PostResponse extends relayTypes<Post>(Post) {}
