import { ObjectType } from '@nestjs/graphql';

import { Paginated } from '../../../core';
import { Post } from '../post.model';

@ObjectType()
export class PostConnection extends Paginated(Post) {}
